import logging

import mercadopago
from django.conf import settings
from django.db import connection
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PagoMP

logger = logging.getLogger(__name__)


class CrearPreferenciaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        compro = request.data.get("compro")
        if not compro:
            return Response({"error": "compro requerido"}, status=status.HTTP_400_BAD_REQUEST)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT SUM(Precio * Cantid * (1 - COALESCE(PorDes, 0) / 100))
                FROM pedidos_detalle
                WHERE Compro = %s
                """,
                [compro],
            )
            row = cursor.fetchone()

        monto = float(row[0]) if row and row[0] else None
        if not monto:
            return Response({"error": "Pedido sin items o monto cero"}, status=status.HTTP_400_BAD_REQUEST)

        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
        preference_data = {
            "items": [{
                "title": f"Pedido {compro}",
                "quantity": 1,
                "unit_price": round(monto, 2),
                "currency_id": "ARS",
            }],
            "external_reference": compro,
            "notification_url": f"{settings.BACKEND_URL}/api/pagos/webhook/",
            "back_urls": {
                "success": f"{settings.FRONTEND_URL}/pedidos/{compro}/pago/exitoso",
                "failure": f"{settings.FRONTEND_URL}/pedidos/{compro}/pago/fallido",
                "pending": f"{settings.FRONTEND_URL}/pedidos/{compro}/pago/pendiente",
            },
            "auto_return": "approved",
        }

        result = sdk.preference().create(preference_data)
        if result["status"] not in (200, 201):
            logger.error("MP crear preferencia error para %s: %s", compro, result)
            return Response(
                {"error": "Error al crear preferencia en Mercado Pago"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        pref = result["response"]

        if PagoMP.objects.filter(pedido_id=compro, estado=PagoMP.Estado.APROBADO).exists():
            return Response(
                {"error": "Este pedido ya fue pagado.", "codigo": "ya_pagado"},
                status=status.HTTP_409_CONFLICT,
            )

        pago, _ = PagoMP.objects.update_or_create(
            pedido_id=compro,
            estado=PagoMP.Estado.PENDIENTE,
            defaults={
                "mp_preference_id": pref["id"],
                "monto": monto,
            },
        )

        return Response({
            "init_point": pref["init_point"],
            "preference_id": pref["id"],
        })


@method_decorator(csrf_exempt, name="dispatch")
class WebhookMPView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        topic = request.data.get("type") or request.query_params.get("topic")
        payment_id = (
            request.data.get("data", {}).get("id")
            or request.query_params.get("id")
        )

        if topic != "payment" or not payment_id:
            return Response(status=status.HTTP_200_OK)

        # Idempotencia temprana: si ya procesamos y escribimos ERP, salir
        existing = PagoMP.objects.filter(mp_payment_id=str(payment_id)).first()
        if existing and existing.erp_comprobante_id:
            return Response(status=status.HTTP_200_OK)

        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
        result = sdk.payment().get(payment_id)
        if result["status"] != 200:
            logger.error("MP get payment error %s: %s", payment_id, result)
            return Response(status=status.HTTP_200_OK)

        payment = result["response"]
        mp_status = payment.get("status")
        compro = payment.get("external_reference")
        monto = payment.get("transaction_amount")

        if not compro:
            return Response(status=status.HTTP_200_OK)

        pago = (
            existing
            or PagoMP.objects.filter(pedido_id=compro).order_by("-creado_en").first()
            or PagoMP(pedido_id=compro)
        )

        pago.mp_payment_id = str(payment_id)
        pago.mp_status = mp_status
        pago.monto = monto

        if mp_status == "approved":
            pago.estado = PagoMP.Estado.APROBADO
            if not existing or not existing.erp_comprobante_id:
                from django.db import transaction as db_transaction
                from .erp import registrar_en_erp
                with db_transaction.atomic():
                    cod_cv = registrar_en_erp(compro, str(payment_id), float(monto or 0))
                pago.erp_comprobante_id = cod_cv
        elif mp_status in ("rejected", "cancelled"):
            pago.estado = PagoMP.Estado.RECHAZADO

        pago.save()
        return Response(status=status.HTTP_200_OK)


class EstadoPagoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, compro):
        pago = (
            PagoMP.objects.filter(pedido_id=compro)
            .order_by("-creado_en")
            .first()
        )
        if not pago:
            return Response({"estado": None})
        return Response({
            "estado": pago.estado,
            "erp_comprobante_id": pago.erp_comprobante_id,
            "monto": float(pago.monto) if pago.monto else None,
        })


class EstadosPagoBatchView(APIView):
    """Devuelve estados de pago para una lista de comprobantes en una sola llamada."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        compros = request.query_params.get("compros", "")
        if not compros:
            return Response({})
        lista = [c.strip() for c in compros.split(",") if c.strip()]
        pagos = (
            PagoMP.objects.filter(pedido_id__in=lista)
            .order_by("pedido_id", "-creado_en")
        )
        # Último pago por pedido
        resultado: dict = {}
        for pago in pagos:
            if pago.pedido_id not in resultado:
                resultado[pago.pedido_id] = pago.estado
        return Response(resultado)
