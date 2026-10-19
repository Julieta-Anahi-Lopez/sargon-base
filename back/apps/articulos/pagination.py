from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ArticulosPagination(PageNumberPagination):
    page_size = 24              # múltiplo de 2, 3 y 4 — compatible con grids de cualquier columna
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'

    def get_count(self, queryset):
        # Cuenta solo por PK para evitar que MySQL evalúe todas las columnas de la vista
        # y la anotación Case/When que solo sirve para ordenar, no para contar.
        try:
            return queryset.values('codigo').count()
        except (AttributeError, TypeError):
            return len(queryset)

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })
