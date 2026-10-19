from django.shortcuts import render, get_object_or_404
from django.core.cache import cache

from rest_framework import viewsets, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import TipoRubros, TipoSubrubros, TipoMarcas
from .serializers import TipoRubrosSerializer, TipoSubrubrosSerializer, TipoRubrosWithSubrubrosSerializer, TipoMarcasSerializer


class TipoRubrosViewSet(viewsets.ReadOnlyModelViewSet):  # Solo permite GET
    serializer_class = TipoRubrosSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TipoRubros.objects.filter(verweb=True)





class TipoSubrubrosViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet que maneja TipoSubrubros con clave primaria compuesta (nrorub, codigo).
    """
    serializer_class = TipoSubrubrosSerializer
    queryset = TipoSubrubros.objects.all()
    lookup_url_kwarg = 'nrorub_codigo'  # Necesario para capturar el parámetro en la URL

    def get_object(self):
        """
        Personaliza la recuperación de un objeto usando `nrorub` y `codigo`.
        """
        lookup_value = self.kwargs.get("nrorub_codigo")

        if lookup_value is None:
            raise ValueError("El parámetro 'nrorub_codigo' no fue recibido correctamente en la URL.")

        try:
            nrorub, codigo = lookup_value.split("-")
        except ValueError:
            raise ValueError(f"El valor '{lookup_value}' no es válido. Debe estar en formato 'nrorub-codigo'.")

        return get_object_or_404(TipoSubrubros, nrorub=nrorub, codigo=codigo)





class TipoRubrosWithSubrubrosViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet que devuelve TipoRubros con sus TipoSubrubros anidados.
    """
    queryset = TipoRubros.objects.filter(verweb=True)
    serializer_class = TipoRubrosSerializer  # Usamos el serializer original para TipoRubros
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """
        Sobreescribe el método list para incluir los TipoSubrubros de cada TipoRubro.
        Usa una única query para todos los subrubros (evita N+1).
        Cachea el resultado 1 hora en Redis (el menú de categorías raramente cambia).
        """
        cached = cache.get('rubros_con_subrubros')
        if cached is not None:
            return Response(cached)

        rubros = list(TipoRubros.objects.filter(verweb=True))
        codigos_rubros = [r.codigo for r in rubros]

        todos_subrubros = TipoSubrubros.objects.filter(nrorub__in=codigos_rubros)
        subrubros_por_rubro = {}
        for sub in todos_subrubros:
            subrubros_por_rubro.setdefault(sub.nrorub, []).append(sub)

        data = []
        for rubro in rubros:
            rubro_data = TipoRubrosSerializer(rubro).data
            subrubros = subrubros_por_rubro.get(rubro.codigo, [])
            rubro_data["subrubros"] = TipoSubrubrosSerializer(subrubros, many=True).data
            data.append(rubro_data)

        cache.set('rubros_con_subrubros', data, 60 * 60)  # 1 hora
        return Response(data)




class TipoMarcasViewSet(viewsets.ReadOnlyModelViewSet):  # Solo permite GET
    serializer_class = TipoMarcasSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return TipoMarcas.objects.filter(verweb=True)