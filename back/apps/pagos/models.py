from django.db import models


class PagoMP(models.Model):
    """Registro de transacciones de Mercado Pago para pedidos web."""

    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        APROBADO  = "aprobado",  "Aprobado"
        RECHAZADO = "rechazado", "Rechazado"

    pedido_id      = models.CharField(max_length=13, db_index=True)
    mp_preference_id = models.CharField(max_length=100, blank=True)
    mp_payment_id  = models.CharField(max_length=100, blank=True, db_index=True)
    mp_status      = models.CharField(max_length=30, blank=True)
    monto          = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    estado         = models.CharField(max_length=20, choices=Estado.choices, default=Estado.PENDIENTE)
    # Código del comprobante ERP generado al aprobar el pago (comprob_ventas.Codigo)
    erp_comprobante_id = models.IntegerField(null=True, blank=True)
    creado_en      = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "web_pagos_mp"
        verbose_name = "Pago MP"

    def __str__(self):
        return f"Pago {self.id} — pedido {self.pedido_id} — {self.estado}"
