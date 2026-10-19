import logging
from datetime import datetime

from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

logger = logging.getLogger(__name__)

from apps.articulos.models import Articulos, VistaArticulos
from apps.parametros.models import get_parametro
from apps.users.models import Contactos

from .models import Pedidos, PedidosDetalle
from .serializers import PedidosCreateSerializer, PedidosSerializer


class PedidosViewSet(ModelViewSet):
    queryset = Pedidos.objects.all()
    serializer_class = PedidosSerializer
    permission_classes = []

    def get_serializer_class(self):
        if self.action == 'create':
            return PedidosCreateSerializer
        return PedidosSerializer

    def get_queryset(self):
        return Pedidos.objects.all()
        # Evaluar agregar despues. Por ahora todos los pedidos
        # return Pedidos.objects.filter(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        # Validar los datos de entrada usando el serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        # Parámetros desde la tabla PARAMETROS (Aplica='Web')
        # Codigo 1: punto de venta, Codigo 2: número de empresa
        punto_venta_raw = get_parametro('Web', 1, default='9')
        punto_venta = str(int(float(punto_venta_raw))).zfill(4)
        nro_emp = int(get_parametro('Web', 2, default='3'))

        # Obtener datos para el pedido
        nro_cliente = request.user.codigo
        print(f"nro_cliente: {nro_cliente}")
        fecha_pedido = datetime.now()
        print(f"fecha_pedido: {fecha_pedido}")
        observaciones = validated_data.get('observ', '')
        print(f"observaciones: {observaciones}")
        nro_usu = 0
        print(f"nro_usu: {nro_usu}")

        # Obtener el vendedor asociado al cliente
        try:
            contacto = Contactos.objects.filter(nrocon=nro_cliente).first()
            if not contacto:
                return Response(
                    {"error": f"No se encontró el contacto para el cliente {nro_cliente}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            nro_vendedor = contacto.nroven
            nrolis = contacto.nrolis  # Lista de precios del contacto
        except Exception as e:
            return Response(
                {"error": f"Error al obtener el vendedor: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        print(f"nro_vendedor: {nro_vendedor}")

        imputa = 0
        print(f"imputa: {imputa}")
        nombre_pc = 'Sitio Web'
        print(f"nombre_pc: {nombre_pc}")
        print(f"nro_emp: {nro_emp}")
        tipo_deposito = 1
        print(f"tipo_deposito: {tipo_deposito}")
        nro_est = '3'
        print(f"nro_est: {nro_est}")

        # Preparar datos del pedido (compro se asigna dentro de la transacción)
        pedido_data = {
            'nrocli': nro_cliente,
            'fecped': fecha_pedido,
            'plazo': '0',
            'lugent': '0',
            'condic': '0',
            'observ': observaciones,
            'nrousu': nro_usu,
            'nroven': nro_vendedor,
            'imputa': imputa,
            'nombpc': nombre_pc,
            'origen': '0',
            'nroemp': nro_emp,
            'tipdep': tipo_deposito,
            'nroest': nro_est,
        }

        # Obtener los detalles del pedido
        detalles_pedido = validated_data['detalle']

        # Validación de stock — consulta única para todos los artículos del pedido.
        # Si algún ítem no tiene stock suficiente (o stock NULL), se rechaza el pedido
        # completo y se devuelve un error estructurado con tipo "stock_insuficiente".
        #
        # IMPORTANTE para el frontend: al recibir este tipo de error NO limpiar el
        # carrito del cliente — debe poder corregir cantidades y reintentar.
        # Pendiente implementar el manejo en el frontend.
        codigos_pedido = [d['codigo'] for d in detalles_pedido]
        # Normalizar a strip para evitar fallos por espacios en códigos del ERP
        codigos_pedido_strip = [c.strip() for c in codigos_pedido]
        vista_rows = VistaArticulos.objects.filter(codigo__in=codigos_pedido_strip)
        # Stock NULL se trata como 0. Si el código aparece varias veces en la vista
        # (posible en vistas con JOIN), se toma el mayor valor de stock.
        stock_map: dict[str, float] = {}
        for v in vista_rows:
            cod = v.codigo.strip() if v.codigo else ''
            stock_val = float(v.stock) if v.stock is not None else 0.0
            if cod not in stock_map or stock_val > stock_map[cod]:
                stock_map[cod] = stock_val
        logger.info('[pedido] stock_map para cliente %s: %s', nro_cliente, stock_map)
        items_sin_stock = []
        for detalle in detalles_pedido:
            codigo = detalle['codigo'].strip()
            cantidad_solicitada = float(detalle['cantidad'])
            stock_disponible = stock_map.get(codigo)
            if stock_disponible is None or stock_disponible < cantidad_solicitada:
                logger.warning(
                    '[pedido] stock insuficiente: codigo=%s solicitado=%s disponible=%s',
                    codigo, cantidad_solicitada, stock_disponible
                )
                items_sin_stock.append(
                    {
                        'codigo': codigo,
                        'solicitado': cantidad_solicitada,
                        'disponible': stock_disponible if stock_disponible is not None else 0,
                    }
                )
        if items_sin_stock:
            return Response(
                {
                    'tipo': 'stock_insuficiente',
                    'mensaje': 'Algunos artículos no tienen stock suficiente para completar el pedido.',
                    'items': items_sin_stock,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Iniciar transacción atómica
        with transaction.atomic():
            try:
                # Lock para evitar números de comprobante duplicados entre requests web simultáneos.
                # NOTA: este lock solo cubre transacciones Django. Si el sistema de escritorio
                # inserta pedidos al mismo tiempo, se necesita una solución a nivel de BD.
                # Pendiente de resolución en reunión con equipo técnico.
                ultimo_pedido = (
                    Pedidos.objects.filter(compro__startswith=f'{punto_venta}-')
                    .select_for_update()
                    .order_by('-compro')
                    .first()
                )
                if ultimo_pedido:
                    ultimo_numero = int(ultimo_pedido.compro.split("-")[1])
                    nuevo_numero = ultimo_numero + 1
                else:
                    nuevo_numero = 1
                nro_comprobante = f"{punto_venta}-{nuevo_numero:08}"
                pedido_data['compro'] = nro_comprobante
                print(f"nro_comprobante: {nro_comprobante}")

                # Crear el pedido
                pedido, creado = Pedidos.objects.get_or_create(**pedido_data)

                if not creado:
                    return Response(
                        {"error": "El pedido ya existe"}, status=status.HTTP_400_BAD_REQUEST
                    )

                # Crear los detalles del pedido
                for i, detalle in enumerate(detalles_pedido, start=1):
                    articulo = Articulos.objects.filter(codigo=detalle['codigo']).first()
                    cantidad = float(detalle['cantidad'])

                    # Preparar datos del detalle
                    detalle_data = {
                        'compro': nro_comprobante,
                        'nroord': i,  # Número de orden secuencial
                        'codart': articulo.codigo,
                        'cantid': cantidad,
                        'descri': articulo.nombre,
                        'penden': cantidad,  # Cantidad pendiente inicialmente igual a cantidad
                        'pendfc': cantidad,  # Pendiente de facturación, inicialmente igual a cantidad
                        'precio': float(detalle['precio']),
                        'nrolis': nrolis,  # Lista de precios del contacto
                        'pordes': float(detalle.get('descuento', 0)),
                        'nroemp': nro_emp,
                        'observ': detalle.get('observacion', ''),
                        'poruni': cantidad,
                    }

                    # Crear el detalle del pedido
                    PedidosDetalle.objects.create(**detalle_data)

                # Si todo fue exitoso, retornar el pedido creado
                response_serializer = PedidosSerializer(pedido)
                headers = self.get_success_headers(response_serializer.data)
                return Response(
                    response_serializer.data, status=status.HTTP_201_CREATED, headers=headers
                )

            except Exception as e:
                # Cualquier error provocará un rollback automático debido a transaction.atomic()
                return Response(
                    {"error": f"Error al crear el pedido y sus detalles: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )


# # Create your views here.
# from rest_framework.viewsets import ModelViewSet
# from rest_framework.response import Response
# from rest_framework import status
# from django.db import transaction
# from datetime import datetime
# from .models import Pedidos, PedidosDetalle
# from apps.users.models import Contactos
# from .serializers import PedidosSerializer, PedidosDetalleSerializer
# from apps.articulos.models import Articulos

# class PedidosViewSet(ModelViewSet):
#     queryset = Pedidos.objects.all()
#     serializer_class = PedidosSerializer
#     permission_classes = []

#     def get_serializer_class(self):
#         #Por ahora lo dejamos definido asi, luego si es necesario agrego otro.
#         return PedidosSerializer

#     def get_queryset(self):
#         return Pedidos.objects.all()
#         #Evaluar agregar despues. Po ahora todos los pedidos
#         # return Pedidos.objects.filter(usuario=self.request.user)

#     def create(self, request, *args, **kwargs):
#         print(f"request.data: {request.data}")

#         # Verificar si se recibieron detalles del pedido
#         if 'detalle' not in request.data or not request.data['detalle']:
#             return Response(
#                 {"error": "El pedido debe contener al menos un ítem de detalle"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Obtener el número de comprobante
#         nro_comprobante = Pedidos.objects.all().order_by('-compro').first()
#         print(f"nro_comprobante antes del manejo: {nro_comprobante}")

#         # Manejar que nro_comprobante devuelve valores en string de tipo 0002-00001365. Debo generar el consecutivo de eso
#         if nro_comprobante:
#             nro_comprobante = nro_comprobante.compro
#             nro_comprobante = nro_comprobante.split("-")
#             nro_comprobante = f"{nro_comprobante[0]}-{int(nro_comprobante[1]) + 1:08}"
#         else:
#             # Si no hay pedidos previos, crear el primer número de comprobante
#             nro_comprobante = "0002-00000001"

#         print(f"nro_comprobante: {nro_comprobante}")

#         # Obtener datos para el pedido
#         nro_cliente = request.user.codigo
#         print(f"nro_cliente: {nro_cliente}")
#         fecha_pedido = datetime.now()
#         print(f"fecha_pedido: {fecha_pedido}")
#         observaciones = request.data.get('observ', '')
#         print(f"observaciones: {observaciones}")
#         nro_usu = 0
#         print(f"nro_usu: {nro_usu}")

#         # Obtener el vendedor asociado al cliente
#         try:
#             contacto = Contactos.objects.filter(nrocon=nro_cliente).first()
#             if not contacto:
#                 return Response(
#                     {"error": f"No se encontró el contacto para el cliente {nro_cliente}"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             nro_vendedor = contacto.nroven
#         except Exception as e:
#             return Response(
#                 {"error": f"Error al obtener el vendedor: {str(e)}"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         print(f"nro_vendedor: {nro_vendedor}")

#         imputa = 0
#         print(f"imputa: {imputa}")
#         nombre_pc = 'Sitio Web'
#         print(f"nombre_pc: {nombre_pc}")
#         nro_emp = 1
#         print(f"nro_emp: {nro_emp}")
#         tipo_deposito = 1
#         print(f"tipo_deposito: {tipo_deposito}")
#         nro_est = '0'
#         print(f"nro_est: {nro_est}")

#         # Preparar datos del pedido
#         pedido_data = {
#             'compro': nro_comprobante,
#             'nrocli': nro_cliente,
#             'fecped': fecha_pedido,
#             'plazo': '0',
#             'lugent': '0',
#             'condic': '0',
#             'observ': observaciones,
#             'nrousu': nro_usu,
#             'nroven': nro_vendedor,
#             'imputa': imputa,
#             'nombpc': nombre_pc,
#             'origen': '0',
#             'nroemp': nro_emp,
#             'tipdep': tipo_deposito,
#             'nroest': nro_est,
#         }

#         # Obtener los detalles del pedido
#         detalles_pedido = request.data['detalle']

#         # Iniciar transacción atómica
#         with transaction.atomic():
#             try:
#                 # Crear el pedido
#                 pedido, creado = Pedidos.objects.get_or_create(**pedido_data)

#                 if not creado:
#                     return Response(
#                         {"error": "El pedido ya existe"},
#                         status=status.HTTP_400_BAD_REQUEST
#                     )

#                 # Crear los detalles del pedido
#                 for i, detalle in enumerate(detalles_pedido, start=1):
#                     # Validar datos del detalle
#                     if 'codigo' not in detalle or 'cantidad' not in detalle or 'precio' not in detalle:
#                         # Si falta algún dato requerido, hacer rollback lanzando una excepción
#                         raise ValueError("Datos de detalle incompletos: cada ítem debe tener código, cantidad y precio")

#                     articulo = Articulos.objects.filter(codigo=detalle['codigo']).first()
#                     cantidad = float(detalle['cantidad'])
#                     # Preparar datos del detalle
#                     detalle_data = {
#                         'compro': nro_comprobante,
#                         'nroord': i,  # Número de orden secuencial
#                         'codart': articulo.codigo,
#                         'cantid': cantidad,
#                         'descri': articulo.nombre,  # Descripción opcional
#                         'penden': cantidad,  # Cantidad pendiente inicialmente igual a cantidad
#                         'pendfc': cantidad,  # Pendiente de facturación, inicialmente igual a cantidad
#                         'precio': float(detalle['precio']),
#                         'nrolis': detalle.get('nrolis', 0),  # Lista de precios, valor por defecto
#                         'pordes': float(detalle.get('descuento', 0)),  # Porcentaje de descuento
#                         'nroemp': nro_emp,
#                         'observ': detalle.get('observacion', ''),  # Observaciones específicas del ítem
#                         'poruni': cantidad  # Porcentaje unitario, inicialmente igual a cantidad
#                     }

#                     # Crear el detalle del pedido
#                     PedidosDetalle.objects.create(**detalle_data)

#                 # Si todo fue exitoso, retornar el pedido creado
#                 serializer = self.get_serializer(pedido)
#                 headers = self.get_success_headers(serializer.data)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

#             except Exception as e:
#                 # Cualquier error provocará un rollback automático debido a transaction.atomic()
#                 return Response(
#                     {"error": f"Error al crear el pedido y sus detalles: {str(e)}"},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )


# from django.shortcuts import render
# from rest_framework.viewsets import ModelViewSet
# from .serializers import PedidosSerializer, PedidosDetalleSerializer
# from .models import Pedidos, PedidosDetalle
# from rest_framework.response import Response
# from rest_framework import status
# from django.db import transaction
# from datetime import datetime
# from apps.users.models import Contactos
# # from rest_framework.permissions import AllowAny

# # Create your views here.
# class PedidosViewSet(ModelViewSet):
#     queryset = Pedidos.objects.all()
#     serializer_class = PedidosSerializer
#     permission_classes = []

#     def get_serializer_class(self):
#         #Por ahora lo dejamos definido asi, luego si es necesario agrego otro.
#         return PedidosSerializer


#     def get_queryset(self):
#         return Pedidos.objects.all()
#         #Evaluar agregar despues. Po ahora todos los pedidos
#         # return Pedidos.objects.filter(usuario=self.request.user)

#     def create(self, request, *args, **kwargs):
#         print(f"request.data: {request.data}")
#         nro_comprobante = Pedidos.objects.all().order_by('-compro').first()
#         print(f"nro_comprobante antes del manejo: {nro_comprobante}")
#         # Manejar que nro_comprobante devuelve valores en string de tipo 0002-00001365. Debo generar el consecutivo de eso
#         if nro_comprobante:
#             nro_comprobante = nro_comprobante.compro
#             nro_comprobante = nro_comprobante.split("-")
#             nro_comprobante = f"{nro_comprobante[0]}-{int(nro_comprobante[1]) + 1:08}"
#         print(f"nro_comprobante: {nro_comprobante}")
#         nro_cliente = request.user.codigo
#         print(f"nro_cliente: {nro_cliente}")
#         fecha_pedido = datetime.now()
#         print(f"fecha_pedido: {fecha_pedido}")
#         observaciones = request.data['observ']
#         print(f"observaciones: {observaciones}")
#         nro_usu = 0
#         print(f"nro_usu: {nro_usu}")
#         nro_vendedor = Contactos.objects.filter(nrocon=nro_cliente).first().nroven
#         print(f"nro_vendedor: {nro_vendedor}")
#         imputa = 0
#         print(f"imputa: {imputa}")
#         nombre_pc = 'Sitio Web'
#         print(f"nombre_pc: {nombre_pc}")
#         nro_emp = 1
#         print(f"nro_emp: {nro_emp}")
#         tipo_deposito = 1
#         print(f"tipo_deposito: {tipo_deposito}")
#         nro_est = '0'
#         print(f"nro_est: {nro_est}")
#         # pedido_detalle = request.data['detalle']
#         # print(f"pedido_detalle: {pedido_detalle}")
#         # for detalle in pedido_detalle:
#         #     print(f"detalle: {detalle}")
#         #     print(f"detalle['codigo']: {detalle['codigo']}")
#         #     print(f"detalle['cantidad']: {detalle['cantidad']}")
#         #     print(f"detalle['precio']: {detalle['precio']}")
#         #     print(f"detalle['descuento']: {detalle['descuento']}")
#         #     print(f"detalle['total']: {detalle['total']}")


#         pedido = {
#             'compro': nro_comprobante,
#             'nrocli': nro_cliente,
#             'fecped': fecha_pedido,
#             'plazo': '0',
#             'lugent': '0',
#             'condic': '0',
#             'observ': observaciones,
#             'nrousu': nro_usu,
#             'nroven': nro_vendedor,
#             'imputa': imputa,
#             'nombpc': nombre_pc,
#             'origen': '0',
#             'nroemp': nro_emp,
#             'tipdep': tipo_deposito,
#             'nroest': nro_est,
#         }

#         with transaction.atomic():
#             try:
#                 pedido, creado = Pedidos.objects.get_or_create(**pedido)
#                 if creado:
#                     serializer = self.get_serializer(pedido)
#                     headers = self.get_success_headers(serializer.data)
#                     return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
#                 else:
#                     return Response({"error": "El pedido ya existe"}, status=status.HTTP_400_BAD_REQUEST)
#             except Exception as e:
#                 return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#         # with transaction.atomic():
#         #     try:
#         #         data = pedido
#         #         serializer = self.get_serializer(data=data)
#         #         serializer.is_valid(raise_exception=True)
#         #         self.perform_create(serializer)
#         #         headers = self.get_success_headers(serializer.data)
#         #         return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
#         #     except Exception as e:
#         #         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# class PedidoDetalleViewSet(ModelViewSet):
#     queryset = PedidosDetalle.objects.all()
#     serializer_class = PedidosDetalleSerializer
#     permission_classes = []

#     def get_serializer_class(self):
#         #Por ahora lo dejamos definido asi, luego si es necesario agrego otro.
#         return PedidosDetalleSerializer

#     def get_queryset(self):
#         return PedidosDetalle.objects.all()
#         #Evaluar agregar despues. Po ahora todos los pedidos
#         # return Pedidos.objects.filter(usuario=self.request.user)
