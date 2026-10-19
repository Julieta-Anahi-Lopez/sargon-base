from rest_framework.permissions import BasePermission


class IsVendedor(BasePermission):
    """
    Permite acceso solo a usuarios autenticados con catusu == 'V' (Vendedor).
    """
    message = "Solo los vendedores pueden realizar esta acción."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "catusu", None) == "V"
        )
