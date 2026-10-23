from django.urls import path

from .views import CrearPreferenciaView, EstadoPagoView, EstadosPagoBatchView, WebhookMPView

urlpatterns = [
    path("crear-preferencia/", CrearPreferenciaView.as_view(), name="crear-preferencia"),
    path("webhook/", WebhookMPView.as_view(), name="webhook-mp"),
    path("estado/<str:compro>/", EstadoPagoView.as_view(), name="estado-pago"),
    path("estados/", EstadosPagoBatchView.as_view(), name="estados-pago-batch"),
]
