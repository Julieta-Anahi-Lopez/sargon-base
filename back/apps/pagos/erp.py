"""
Escritura de las 7 tablas del ERP ante un pago MP aprobado.
Estructura y valores según especificación del DBA (oct-2026).

Constante a actualizar una vez que el ERP tenga código propio para MP:
  TIP_PAG_MP : actualmente 6 = "Tarjetas". Reemplazar por el código
               que el administrador del ERP asigne a "Mercado Pago".
"""

import logging
from datetime import datetime, timedelta

from django.db import connection, transaction

from apps.parametros.models import get_parametro

logger = logging.getLogger(__name__)

# ── Constante pendiente de definición en ERP ─────────────────────────────────
TIP_PAG_MP = 6   # Tarjetas — actualizar por código "Mercado Pago" cuando exista
# ─────────────────────────────────────────────────────────────────────────────

IVA_RATES = {1: 0.21, 2: 0.105, 3: 0.27, 4: 0.0}


def _next_codigo(cursor, table: str, nro_emp: int) -> int:
    cursor.execute(
        f"SELECT COALESCE(MAX(Codigo), 0) + 1 FROM {table} WHERE NroEmp = %s FOR UPDATE",
        [nro_emp],
    )
    return cursor.fetchone()[0]


def registrar_en_erp(pedido_compro: str, mp_payment_id: str, monto: float) -> int:
    """
    Escribe las 7 tablas del ERP para un pago MP aprobado.
    Retorna comprob_ventas.Codigo (se guarda en PagoMP.erp_comprobante_id).
    Debe llamarse dentro de transaction.atomic().
    """
    nro_emp     = int(get_parametro('Web', 2, default='3'))
    punto_venta = str(int(float(get_parametro('Web', 1, default='9')))).zfill(4)
    ahora       = datetime.now()

    with connection.cursor() as c:

        # ── Datos del pedido ──────────────────────────────────────────────────
        c.execute(
            "SELECT NroCli, NroVen FROM pedidos WHERE Compro = %s AND NroEmp = %s",
            [pedido_compro, nro_emp],
        )
        row = c.fetchone()
        if not row:
            raise ValueError(f"Pedido no encontrado: {pedido_compro}")
        nro_cli, nro_ven = row

        # ── Datos del cliente (contactos) ─────────────────────────────────────
        c.execute(
            """
            SELECT Nombre, Provin, Cuit, CatIva,
                   COALESCE(DomCal,''), COALESCE(DomNro,''),
                   COALESCE(Locali, 0), COALESCE(VtoCta, 0), COALESCE(NroLis, 0)
            FROM contactos
            WHERE NroCon = %s
            """,
            [nro_cli],
        )
        cli = c.fetchone()
        if cli:
            nombre_cli, provin, cuit, cat_iva = cli[0], cli[1] or 1, cli[2] or '', (cli[3] or '7')[:1]
            domcal, domnro  = cli[4], cli[5]
            locali_cod      = cli[6]
            vto_cta         = cli[7]
            nro_lis         = cli[8]
        else:
            nombre_cli, provin, cuit, cat_iva = '', 1, '', '7'
            domcal, domnro, locali_cod, vto_cta, nro_lis = '', '', 0, 0, 0

        domici   = f"{domcal} {domnro}".strip()
        fec_dif  = ahora + timedelta(days=int(vto_cta))

        # Localidad: formato "(8000) Bahia Blanca"
        locali_str = ''
        if locali_cod:
            c.execute(
                "SELECT Codigo, Nombre FROM tipo_localidades WHERE Codigo = %s",
                [locali_cod],
            )
            loc = c.fetchone()
            if loc:
                locali_str = f"({loc[0]}) {loc[1]}"

        # ── Ítems del pedido con TabIva desde articulos ───────────────────────
        c.execute(
            """
            SELECT pd.CodArt, pd.Descri, pd.Cantid, pd.Precio,
                   COALESCE(pd.PorDes, 0),
                   COALESCE(a.Precio, 0)    AS pCosto,
                   COALESCE(a.TabIva, 1)    AS TabIva
            FROM pedidos_detalle pd
            LEFT JOIN articulos a ON TRIM(a.Codigo) = TRIM(pd.CodArt)
            WHERE pd.Compro = %s AND pd.NroEmp = %s
            ORDER BY pd.NroOrd
            """,
            [pedido_compro, nro_emp],
        )
        items = c.fetchall()
        if not items:
            raise ValueError(f"Pedido sin ítems: {pedido_compro}")

        # ── Cálculos de IVA ───────────────────────────────────────────────────
        iva_sums = {1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0}
        for _, _, cantid, precio, por_des, _, tab_iva in items:
            neto = cantid * precio * (1 - por_des / 100)
            iva_sums[tab_iva if tab_iva in iva_sums else 1] += neto

        deb_fis = round(
            iva_sums[1] * 0.21 + iva_sums[2] * 0.105 + iva_sums[3] * 0.27, 4
        )

        # ── 1. comprob_ventas ─────────────────────────────────────────────────
        cod_cv = _next_codigo(c, 'comprob_ventas', nro_emp)

        c.execute(
            "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(Compro,'-',-1) AS UNSIGNED)),0)+1 "
            "FROM comprob_ventas WHERE NroEmp=%s AND Compro LIKE %s",
            [nro_emp, f"{punto_venta}-%"],
        )
        compro_cv = f"{punto_venta}-{c.fetchone()[0]:08}"

        c.execute(
            """
            INSERT INTO comprob_ventas
              (NroEmp,Codigo,NroCli,Nombre,Provin,Cuit,CatIva,TipRub,
               FecOpe,FecDif,CodDGR,TipOpe,TipCom,Letra,Compro,Observ,
               OpeExe,IvaIn1,IvaIn2,IvaIn3,IvaIn4,IvaIn5,
               DebFis,IvaRni,ReTope,PerIva,RetIva,RetIng,ImpInt,
               NoGrav,Varios,TotOpe,ImpRes,ImpIva,TipMov,Cancel,
               NombPC,Moneda,RetSUS,RetGan,Imputa,PerIng,
               FecReg,ModReg,RetMun,TotITC,ImpCO2,Cotiza)
            VALUES
              (%s,%s,%s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s)
            """,
            [
                nro_emp, cod_cv, nro_cli, nombre_cli, provin, cuit, cat_iva, 0,
                ahora, fec_dif, 0, 1, 12, 'X', compro_cv,
                f"Pago MP {mp_payment_id}",
                0,
                round(iva_sums[1], 4), round(iva_sums[2], 4),
                round(iva_sums[3], 4), round(iva_sums[4], 4), 0,
                deb_fis, 0, 0, 0, 0, 0, 0,
                0, 0, round(monto, 2), 0, 0, 1, 0,
                'Sitio Web', 0, 0, 0, 0, 0,
                ahora, 'W', 0, 0, 0, 1.0,
            ],
        )

        # ── 2. comprobantes ───────────────────────────────────────────────────
        c.execute(
            """
            INSERT INTO comprobantes
              (Codigo,NroVen,NroFac,Domici,Locali,PorDes,CarFin,
               Remito,Condic,OrdenC,TipFle,ValDec,Bultos,fEnvio,
               mPagos,Puerto,TotFle,Seguro,NroTra,NomCon,
               Valide,Entreg,NroEmp,NroCar,Comis1,ObsCo1,Comis2,ObsCo2)
            VALUES
              (%s,%s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,
               %s,%s,%s,%s,%s,%s,%s,%s)
            """,
            [
                cod_cv, nro_ven, 0, domici, locali_str, 0, 0,
                '', '', '', 0, '', '', '',
                '', '', 0, 0, 0, '',
                '', '', nro_emp, 0, 0, '', 0, '',
            ],
        )

        # ── 3. items_comprobantes (OrdImp desde 0) ────────────────────────────
        for i, (cod_art, descri, cantid, precio, por_des, p_costo, tab_iva) in enumerate(items):
            neto_gr = cantid * precio * (1 - por_des / 100)
            tab_iva_key = tab_iva if tab_iva in IVA_RATES else 1
            deb_fis_item = round(neto_gr * IVA_RATES[tab_iva_key], 4)
            c.execute(
                """
                INSERT INTO items_comprobantes
                  (Codigo,OrdImp,CodArt,Cantid,Descri,NroLis,
                   PreUni,Descue,PorDes,OpeExe,NetoGr,
                   DebFis,IvaRni,PerIva,RetIva,RetIng,ImpInt,
                   pCosto,ColAdi,TabIva,NroEmp,PrFijo,TotITC,ImpCO2,PorUni)
                VALUES
                  (%s,%s,%s,%s,%s,%s,
                   %s,%s,%s,%s,%s,
                   %s,%s,%s,%s,%s,%s,
                   %s,%s,%s,%s,%s,%s,%s,%s)
                """,
                [
                    cod_cv, i, cod_art, cantid, descri or '', nro_lis,
                    precio, 0, 0, 0, round(neto_gr, 4),
                    deb_fis_item, 0, 0, 0, 0, 0,
                    p_costo, '', tab_iva_key, nro_emp, 0, 0, 0, 0,
                ],
            )

        # ── 4. movimientos_stk ────────────────────────────────────────────────
        tip_dep = int(get_parametro('Web', 3, default='2'))
        compro_stk = f"RV X {compro_cv}"

        for cod_art, _, cantid, precio, _, _, _ in items:
            c.execute(
                """
                INSERT INTO movimientos_stk
                  (Codigo,FecMov,NroCon,Nombre,TipDes,TipMov,
                   CodCom,Compro,Cantid,PreUni,TipDep,
                   OrdenC,Confor,Observ,NroEmp,NroUsu,Bultos)
                VALUES
                  (%s,%s,%s,%s,%s,%s,
                   %s,%s,%s,%s,%s,
                   %s,%s,%s,%s,%s,%s)
                """,
                [
                    cod_art, ahora, nro_cli, nombre_cli, 0, 2,
                    cod_cv, compro_stk, cantid, precio, tip_dep,
                    0, 0, '', nro_emp, 0, cantid,
                ],
            )

        # ── 5. pagos ──────────────────────────────────────────────────────────
        cod_pago = _next_codigo(c, 'pagos', nro_emp)
        c.execute(
            "INSERT INTO pagos (NroEmp,Codigo,CodVta,CodCra,FecPag) VALUES (%s,%s,%s,%s,%s)",
            [nro_emp, cod_pago, cod_cv, 0, ahora],
        )

        # ── 6. pagos_detalle ──────────────────────────────────────────────────
        c.execute(
            "INSERT INTO pagos_detalle (NroEmp,Codigo,TipPag,ImpPag,CodChe,CodAsi) "
            "VALUES (%s,%s,%s,%s,%s,%s)",
            [nro_emp, cod_pago, TIP_PAG_MP, round(monto, 2), 0, 0],
        )

        # ── 7. movimientos_caja ───────────────────────────────────────────────
        tip_caj_str = get_parametro('Web', 4, default='1')
        cod_caja    = _next_codigo(c, 'movimientos_caja', nro_emp)
        c.execute(
            """
            INSERT INTO movimientos_caja
              (NroEmp,Codigo,FecMov,TipRub,Observ,TotIng,TotEgr,
               CodCom,TipMov,TipPag,NroUsu,TipCaj)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            [nro_emp, cod_caja, ahora, 0, '', round(monto, 2), 0,
             cod_cv, 'V', TIP_PAG_MP, 0, tip_caj_str],
        )

    logger.info(
        "ERP OK: comprob_ventas=%s pagos=%s caja=%s pedido=%s mp_payment=%s",
        cod_cv, cod_pago, cod_caja, pedido_compro, mp_payment_id,
    )
    return cod_cv
