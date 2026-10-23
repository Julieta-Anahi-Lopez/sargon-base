"""
Vistas del módulo vendedor — reportes de actividad web de clientes.
Todas requieren IsVendedor (catusu='V').
"""
from datetime import date, datetime, timedelta

from django.db import connection
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsVendedor


def _fmt_fecha(v):
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.strftime("%d/%m/%Y %H:%M")
    if isinstance(v, date):
        return v.strftime("%d/%m/%Y")
    return str(v)


def _nro_emp():
    from apps.parametros.models import get_parametro
    return int(get_parametro('Web', 2, default='3'))


class DashboardVendedorView(APIView):
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request):
        nro_emp = _nro_emp()
        hoy = date.today()
        inicio_semana = hoy - timedelta(days=hoy.weekday())
        inicio_mes = hoy.replace(day=1)

        with connection.cursor() as c:
            # Pedidos web del mes
            c.execute("""
                SELECT COUNT(*), COALESCE(SUM(pd.total), 0)
                FROM pedidos p
                LEFT JOIN (
                    SELECT Compro, SUM(Cantid * Precio) AS total
                    FROM pedidos_detalle
                    GROUP BY Compro
                ) pd ON pd.Compro = p.Compro
                WHERE p.NroEmp = %s AND p.NombPC = 'Sitio Web'
                  AND p.FecPed >= %s
            """, [nro_emp, inicio_mes])
            mes = c.fetchone()

            # Pedidos de esta semana
            c.execute("""
                SELECT COUNT(*), COALESCE(SUM(pd.total), 0)
                FROM pedidos p
                LEFT JOIN (
                    SELECT Compro, SUM(Cantid * Precio) AS total
                    FROM pedidos_detalle
                    GROUP BY Compro
                ) pd ON pd.Compro = p.Compro
                WHERE p.NroEmp = %s AND p.NombPC = 'Sitio Web'
                  AND p.FecPed >= %s
            """, [nro_emp, inicio_semana])
            semana = c.fetchone()

            # Pedidos hoy
            c.execute("""
                SELECT COUNT(*)
                FROM pedidos
                WHERE NroEmp = %s AND NombPC = 'Sitio Web'
                  AND DATE(FecPed) = %s
            """, [nro_emp, hoy])
            hoy_count = c.fetchone()[0]

            # Pagos este mes
            c.execute("""
                SELECT
                    SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN estado = 'aprobado' THEN monto ELSE 0 END),
                    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END)
                FROM web_pagos_mp
                WHERE creado_en >= %s
            """, [inicio_mes])
            pagos = c.fetchone()

            # Carritos activos ahora
            c.execute("SELECT COUNT(DISTINCT NroCli) FROM web_carrito")
            carritos = c.fetchone()[0]

            # Clientes sin pedido en últimos 30 días
            c.execute("""
                SELECT COUNT(DISTINCT wu.Codigo)
                FROM web_usuarios wu
                WHERE wu.CatUsu = 'C'
                  AND NOT EXISTS (
                      SELECT 1 FROM pedidos p
                      WHERE p.NroCli = wu.Codigo
                        AND p.NroEmp = %s
                        AND p.FecPed >= %s
                  )
            """, [nro_emp, hoy - timedelta(days=30)])
            inactivos = c.fetchone()[0]

        return Response({
            "hoy":            {"pedidos": hoy_count},
            "semana":         {"pedidos": semana[0], "monto": float(semana[1])},
            "mes":            {"pedidos": mes[0],    "monto": float(mes[1])},
            "pagos_mes":      {
                "aprobados": pagos[0] or 0,
                "monto_cobrado": float(pagos[1] or 0),
                "pendientes": pagos[2] or 0,
            },
            "carritos_activos": carritos,
            "clientes_inactivos_30d": inactivos,
        })


class PedidosWebView(APIView):
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request):
        nro_emp = _nro_emp()
        fecha_desde = request.query_params.get("desde", str(date.today() - timedelta(days=30)))
        fecha_hasta = request.query_params.get("hasta", str(date.today()))
        nro_cli = request.query_params.get("nro_cli")

        params = [nro_emp, fecha_desde, fecha_hasta]
        filtro_cli = ""
        if nro_cli:
            filtro_cli = "AND p.NroCli = %s"
            params.append(nro_cli)

        with connection.cursor() as c:
            c.execute(f"""
                SELECT
                    p.Compro, p.NroCli, c.Nombre,
                    p.FecPed,
                    COALESCE(SUM(pd.Cantid * pd.Precio), 0) AS total,
                    mp.estado, mp.monto AS monto_mp, mp.erp_comprobante_id
                FROM pedidos p
                LEFT JOIN contactos c ON c.NroCon = p.NroCli
                LEFT JOIN pedidos_detalle pd ON pd.Compro = p.Compro AND pd.NroEmp = p.NroEmp
                LEFT JOIN (
                    SELECT pedido_id, estado, monto, erp_comprobante_id
                    FROM web_pagos_mp wmp1
                    WHERE creado_en = (
                        SELECT MAX(creado_en) FROM web_pagos_mp wmp2
                        WHERE wmp2.pedido_id = wmp1.pedido_id
                    )
                ) mp ON mp.pedido_id = p.Compro
                WHERE p.NroEmp = %s
                  AND p.NombPC = 'Sitio Web'
                  AND DATE(p.FecPed) BETWEEN %s AND %s
                  {filtro_cli}
                GROUP BY p.Compro, p.NroCli, c.Nombre, p.FecPed,
                         mp.estado, mp.monto, mp.erp_comprobante_id
                ORDER BY p.FecPed DESC
                LIMIT 200
            """, params)
            rows = c.fetchall()

        return Response([{
            "compro":             r[0],
            "nro_cli":            r[1],
            "cliente":            r[2] or "",
            "fecha":              _fmt_fecha(r[3]),
            "total":              float(r[4]),
            "estado_pago":        r[5],
            "monto_mp":           float(r[6]) if r[6] else None,
            "erp_comprobante_id": r[7],
        } for r in rows])


class CarritosActivosView(APIView):
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request):
        with connection.cursor() as c:
            c.execute("""
                SELECT
                    wc.NroCli,
                    c.Nombre,
                    COUNT(wc.CodArt)            AS items,
                    SUM(wc.Cantid * wc.Precio)  AS monto_estimado,
                    GROUP_CONCAT(
                        CONCAT(wc.Cantid, 'x ', COALESCE(wc.CodArt,''))
                        ORDER BY wc.CodArt SEPARATOR ', '
                    ) AS resumen
                FROM web_carrito wc
                LEFT JOIN contactos c ON c.NroCon = wc.NroCli
                GROUP BY wc.NroCli, c.Nombre
                ORDER BY monto_estimado DESC
            """)
            rows = c.fetchall()

        return Response([{
            "nro_cli":        r[0],
            "cliente":        r[1] or "",
            "items":          r[2],
            "monto_estimado": float(r[3]) if r[3] else 0,
            "resumen":        r[4] or "",
        } for r in rows])


class ClientesInactivosView(APIView):
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request):
        nro_emp = _nro_emp()
        dias = int(request.query_params.get("dias", 30))
        desde = date.today() - timedelta(days=dias)

        with connection.cursor() as c:
            c.execute("""
                SELECT
                    wu.Codigo,
                    c.Nombre,
                    MAX(p.FecPed)                           AS ultimo_pedido,
                    DATEDIFF(NOW(), MAX(p.FecPed))         AS dias_sin_pedido
                FROM web_usuarios wu
                LEFT JOIN contactos c ON c.NroCon = wu.Codigo
                LEFT JOIN pedidos p ON p.NroCli = wu.Codigo AND p.NroEmp = %s
                WHERE wu.CatUsu = 'C'
                GROUP BY wu.Codigo, c.Nombre
                HAVING MAX(p.FecPed) IS NULL OR MAX(p.FecPed) < %s
                ORDER BY dias_sin_pedido DESC
            """, [nro_emp, desde])
            rows = c.fetchall()

        return Response([{
            "nro_cli":          r[0],
            "cliente":          r[1] or "",
            "ultimo_pedido":    _fmt_fecha(r[2]),
            "dias_sin_pedido":  r[3] if r[3] is not None else None,
        } for r in rows])


class ProductosRankingView(APIView):
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request):
        nro_emp = _nro_emp()
        dias = int(request.query_params.get("dias", 30))
        desde = date.today() - timedelta(days=dias)

        with connection.cursor() as c:
            c.execute("""
                SELECT
                    pd.CodArt,
                    pd.Descri,
                    SUM(pd.Cantid)          AS total_unidades,
                    COUNT(DISTINCT p.Compro) AS total_pedidos,
                    SUM(pd.Cantid * pd.Precio) AS monto_total
                FROM pedidos_detalle pd
                JOIN pedidos p ON p.Compro = pd.Compro AND p.NroEmp = pd.NroEmp
                WHERE p.NroEmp = %s
                  AND p.NombPC = 'Sitio Web'
                  AND p.FecPed >= %s
                GROUP BY pd.CodArt, pd.Descri
                ORDER BY total_unidades DESC
                LIMIT 20
            """, [nro_emp, desde])
            rows = c.fetchall()

        return Response([{
            "codart":         r[0],
            "nombre":         r[1] or "",
            "total_unidades": float(r[2]),
            "total_pedidos":  r[3],
            "monto_total":    float(r[4]),
        } for r in rows])


class PedidoDetalleVendedorView(APIView):
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request, compro):
        nro_emp = _nro_emp()
        with connection.cursor() as c:
            c.execute("""
                SELECT pd.CodArt, pd.Descri, pd.Cantid, pd.Precio,
                       pd.Cantid * pd.Precio AS subtotal
                FROM pedidos_detalle pd
                WHERE pd.Compro = %s AND pd.NroEmp = %s
                ORDER BY pd.NroOrd
            """, [compro, nro_emp])
            rows = c.fetchall()

        return Response([{
            "codart":   r[0],
            "nombre":   r[1] or "",
            "cantid":   float(r[2]),
            "precio":   float(r[3]),
            "subtotal": float(r[4]),
        } for r in rows])


class ClienteDetalleView(APIView):
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request, nro_con):
        nro_emp = _nro_emp()

        with connection.cursor() as c:
            # Datos del cliente
            c.execute("""
                SELECT c.Nombre, c.Cuit, wu.email
                FROM contactos c
                LEFT JOIN web_usuarios wu ON wu.Codigo = c.NroCon
                WHERE c.NroCon = %s
                LIMIT 1
            """, [nro_con])
            cli = c.fetchone()

            # Pedidos del cliente
            c.execute("""
                SELECT
                    p.Compro, p.FecPed,
                    COALESCE(SUM(pd.Cantid * pd.Precio), 0) AS total,
                    mp.estado
                FROM pedidos p
                LEFT JOIN pedidos_detalle pd ON pd.Compro = p.Compro AND pd.NroEmp = p.NroEmp
                LEFT JOIN (
                    SELECT pedido_id, estado
                    FROM web_pagos_mp wmp1
                    WHERE creado_en = (
                        SELECT MAX(creado_en) FROM web_pagos_mp wmp2
                        WHERE wmp2.pedido_id = wmp1.pedido_id
                    )
                ) mp ON mp.pedido_id = p.Compro
                WHERE p.NroCli = %s AND p.NroEmp = %s AND p.NombPC = 'Sitio Web'
                GROUP BY p.Compro, p.FecPed, mp.estado
                ORDER BY p.FecPed DESC
                LIMIT 50
            """, [nro_con, nro_emp])
            pedidos = c.fetchall()

            # Carrito actual
            c.execute("""
                SELECT wc.CodArt, wc.Cantid, wc.Precio,
                       COALESCE(a.Nombre, wc.CodArt) AS nombre
                FROM web_carrito wc
                LEFT JOIN articulos a ON TRIM(a.Codigo) = TRIM(wc.CodArt)
                WHERE wc.NroCli = %s
            """, [nro_con])
            carrito = c.fetchall()

        return Response({
            "cliente": {
                "nombre": cli[0] if cli else "",
                "cuit":   cli[1] if cli else "",
                "login":  cli[2] if cli else "",
            },
            "pedidos": [{
                "compro":      r[0],
                "fecha":       _fmt_fecha(r[1]),
                "total":       float(r[2]),
                "estado_pago": r[3],
            } for r in pedidos],
            "carrito": [{
                "codart": r[0],
                "cantid": float(r[1]),
                "precio": float(r[2]),
                "nombre": r[3],
                "subtotal": float(r[1]) * float(r[2]),
            } for r in carrito],
        })
