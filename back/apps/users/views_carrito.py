from django.db import connection, transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


class CarritoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Devuelve el carrito guardado del usuario.
        El precio devuelto es el VIGENTE en el catálogo (COALESCE(Neto, Precio)),
        no el almacenado en web_carrito, para evitar precios desactualizados.
        """
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT wc.CodArt, wc.Cantid, COALESCE(va.Neto, va.Precio), va.Nombre, va.Stock
                FROM web_carrito wc
                INNER JOIN vista_articulos va ON wc.CodArt = va.Codigo
                WHERE wc.NroCli = %s
            """, [request.user.codigo])
            rows = cursor.fetchall()

        return Response([{
            'codart': row[0],
            'cantid': row[1],
            'precio': row[2],
            'nombre': row[3] or '',
            'stock':  row[4] if row[4] is not None else 0,
        } for row in rows])

    def post(self, request):
        """Sincroniza el carrito completo: reemplaza todos los ítems del usuario."""
        items = request.data
        if not isinstance(items, list):
            return Response({'error': 'Se esperaba una lista de ítems'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM web_carrito WHERE NroCli = %s", [request.user.codigo])
                for item in items:
                    cursor.execute(
                        "INSERT INTO web_carrito (NroCli, CodArt, Cantid, Precio) VALUES (%s, %s, %s, %s)",
                        [request.user.codigo, item['codart'], item['cantid'], item['precio']]
                    )

        return Response(status=status.HTTP_200_OK)

    def delete(self, request):
        """Vacía el carrito del usuario (se llama al confirmar un pedido)."""
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM web_carrito WHERE NroCli = %s", [request.user.codigo])
        return Response(status=status.HTTP_204_NO_CONTENT)
