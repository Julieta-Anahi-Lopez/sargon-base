import django_filters
from .models import VistaArticulos


class VistaArticulosFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(lookup_expr='icontains')
    codigo = django_filters.CharFilter(lookup_expr='icontains')
    precio_min = django_filters.NumberFilter(field_name='precio', lookup_expr='gte')
    precio_max = django_filters.NumberFilter(field_name='precio', lookup_expr='lte')

    class Meta:
        model = VistaArticulos
        fields = ['rubro', 'subrubro', 'nromar', 'codigo', 'nombre', 'precio_min', 'precio_max']
