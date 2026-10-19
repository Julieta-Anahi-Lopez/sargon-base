import hashlib
import json
import logging

from rest_framework import viewsets
from rest_framework.response import Response
from django.core.cache import cache
from django.db.models import Q

from .models import Imagenes, VistaArticulos
from .serializers import ArticulosAutenticatedSerializer, ArticulosSerializer, ImagenesSerializer
from .pagination import ArticulosPagination
from apps.users.models import Contactos

logger = logging.getLogger(__name__)


class ArticulosViewSet(viewsets.ModelViewSet):
    serializer_class = ArticulosAutenticatedSerializer
    pagination_class = ArticulosPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        contacto = None
        if self.request.user.is_authenticated:
            cache_key = f'contacto_{self.request.user.codigo}'
            contacto = cache.get(cache_key)
            if contacto is None:
                contacto = Contactos.objects.filter(nrocon=self.request.user.codigo).first()
                cache.set(cache_key, contacto, 300)  # 5 minutos
        context['contacto'] = contacto
        return context

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return ArticulosAutenticatedSerializer
        return ArticulosSerializer

    def get_queryset(self):
        """
        Devuelve el queryset de VistaArticulos con los filtros de URL aplicados.
        El ordenamiento prioriza la marca nromar=6 (Walker), luego por marca y stock descendente.

        Filtros aceptados:
          - nrogru:     código de rubro (categoría)
          - nrosub:     código de subrubro (subcategoría)
          - nromar:     código de marca
          - precio_min: precio mínimo (inclusive)
          - precio_max: precio máximo (inclusive)
          - codigo:     búsqueda parcial por código de artículo
          - nombre:     búsqueda parcial por nombre (case-insensitive)

        NOTA: el campo 'observ' fue eliminado porque no existe en vista_articulos.
        Si se necesita búsqueda en observaciones, hay que extender la vista SQL
        o agregar un JOIN con la tabla articulos. Pendiente evaluar con el equipo.
        """
        params = self.request.query_params

        rubro = params.get('nrogru')
        subrubro = params.get('nrosub')
        nromar = params.get('nromar')
        precio_min = params.get('precio_min')
        precio_max = params.get('precio_max')
        busqueda = params.get('nombre')
        ordering   = params.get('ordering')
        solo_stock = params.get('solo_stock')

        ORDERING_MAP = {
            'nombre_asc':   ('nombre',),
            'nombre_desc':  ('-nombre',),
            'precio_asc':   ('precio',),
            'precio_desc':  ('-precio',),
        }
        order_fields = ORDERING_MAP.get(ordering, ('nromar', '-stock'))
        queryset = VistaArticulos.objects.order_by(*order_fields)

        if rubro:
            queryset = queryset.filter(rubro=rubro)
        if subrubro:
            queryset = queryset.filter(subrubro=subrubro)
        if nromar:
            queryset = queryset.filter(nromar=nromar)
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)
        if busqueda:
            # Cada palabra debe aparecer en el nombre (AND), igual que el Hermes.
            # "aceite oliva" encuentra artículos que contienen ambas palabras en
            # cualquier orden, en lugar de exigir la frase exacta.
            q_nombre = Q()
            for palabra in busqueda.split():
                q_nombre &= Q(nombre__icontains=palabra)
            queryset = queryset.filter(q_nombre | Q(codigo__icontains=busqueda))
        if solo_stock in ('1', 'true', 'True'):
            queryset = queryset.filter(stock__gt=0)

        return queryset

    def _attach_imagenes(self, items):
        """
        Carga las imágenes en una única query para la lista de objetos recibida
        y las adjunta como atributo imagenes_cache en cada objeto.
        Evita el problema N+1 sin cargar imágenes de toda la BD.
        """
        codigos = [obj.codigo for obj in items]
        imagenes_qs = Imagenes.objects.filter(codimg__in=codigos)

        imagenes_dict = {}
        for img in imagenes_qs:
            imagenes_dict.setdefault(img.codimg, []).append(img)

        for obj in items:
            obj.imagenes_cache = imagenes_dict.get(obj.codigo, [])

    # Filtros de navegación: combinaciones finitas y predecibles → cacheables.
    # Búsqueda libre (nombre, codigo): infinitas variantes → nunca se cachean.
    CACHE_PARAMS = {'nrogru', 'nrosub', 'nromar', 'precio_min', 'precio_max', 'page', 'page_size', 'ordering', 'solo_stock'}
    FREE_SEARCH_PARAMS = {'nombre'}

    def _get_nrolis_for_cache(self):
        """
        Retorna el nrolis del contacto autenticado (0 o 1) o 'anon'.
        Usar nrolis en lugar del código de usuario permite que todos los usuarios
        con la misma lista de precios compartan la misma entrada de caché.
        """
        user = self.request.user
        if not user.is_authenticated:
            return 'anon'
        cache_key = f'contacto_{user.codigo}'
        contacto = cache.get(cache_key)
        if contacto is None:
            contacto = Contactos.objects.filter(nrocon=user.codigo).first()
            cache.set(cache_key, contacto, 300)
        return str(contacto.nrolis) if contacto else 'anon'

    def _build_cache_key(self, request, nrolis):
        """
        Construye la clave de caché usando solo los parámetros de navegación.
        Retorna None si el request incluye búsqueda libre (no cacheable).
        """
        params = dict(request.query_params)
        if any(p in params for p in self.FREE_SEARCH_PARAMS):
            return None
        nav_params = {k: v for k, v in params.items() if k in self.CACHE_PARAMS}
        params_hash = hashlib.md5(
            json.dumps(nav_params, sort_keys=True).encode()
        ).hexdigest()
        return f'articulos_{nrolis}_{params_hash}'

    def list(self, request, *args, **kwargs):
        """
        Lista paginada de artículos con caché híbrido:
        - Navegación por filtros (rubro, subrubro, marca, página): se cachea 5 min en Redis.
          Clave: nrolis (0, 1 o anon) + hash de los params de navegación.
          Dos usuarios con la misma lista de precios comparten la entrada de caché.
        - Búsqueda libre (nombre, codigo): va siempre a BD, no se cachea.

        Respuesta:
          {
            "count":        <total de resultados con los filtros aplicados>,
            "total_pages":  <cantidad de páginas>,
            "current_page": <página actual>,
            "page_size":    <ítems por página>,
            "next":         <URL de la página siguiente o null>,
            "previous":     <URL de la página anterior o null>,
            "results":      [...]
          }

        PENDIENTE FRONTEND:
          - Leer el campo 'count' para mostrar el total de resultados.
          - Leer 'total_pages' y 'current_page' para renderizar controles de paginación.
          - Agregar el query param 'page' a los requests (?page=2&nrogru=3&...).
          - Los filtros se aplican en el servidor sobre el set completo — no filtrar en cliente.
          - El param 'page_size' permite override puntual si se necesita (máx 100).
          - El filtro 'observ' fue removido del backend (campo no existe en la vista SQL).
            Si el frontend lo manda, simplemente se ignora. Actualizar useProducts para no enviarlo.
        """
        nrolis = self._get_nrolis_for_cache()
        cache_key = self._build_cache_key(request, nrolis)

        if cache_key:
            cached = cache.get(cache_key)
            if cached is not None:
                return Response(cached)

        queryset = self.get_queryset()
        logger.debug('[ArticulosViewSet] SQL: %s', queryset.query)
        page = self.paginate_queryset(queryset)
        self._attach_imagenes(page)
        serializer = self.get_serializer(page, many=True)
        response_data = self.get_paginated_response(serializer.data).data

        if cache_key:
            cache.set(cache_key, response_data, 60 * 5)  # 5 minutos

        return Response(response_data)

    def retrieve(self, request, *args, **kwargs):
        """Detalle de un artículo. Carga sus imágenes antes de serializar."""
        instance = self.get_object()
        self._attach_imagenes([instance])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ImagenesViewSet(viewsets.ModelViewSet):
    queryset = Imagenes.objects.all()
    serializer_class = ImagenesSerializer
