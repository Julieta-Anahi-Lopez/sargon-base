from functools import cached_property

from rest_framework import serializers
from .models import Imagenes, VistaArticulos
from django.conf import settings


class ArticulosBaseSerializer(serializers.ModelSerializer):
    imagenes = serializers.SerializerMethodField()

    @cached_property
    def _media_base_url(self):
        """
        Construye el prefijo base para las URLs de imágenes una sola vez por
        instancia del serializer. Con many=True, DRF reutiliza la misma instancia
        child para todos los ítems, así que cached_property garantiza que
        build_absolute_uri se llama una única vez por request, no una vez por artículo.
        """
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(settings.MEDIA_URL)
        return settings.MEDIA_URL

    def get_imagenes(self, obj):
        imagenes = getattr(obj, 'imagenes_cache', [])
        if not imagenes:
            return []
        imagenes_dict = {
            f"foto_{i}": f"{self._media_base_url}Imagenes/{img.nomarc}"
            for i, img in enumerate(imagenes, start=1)
        }
        return [imagenes_dict]

    class Meta:
        model = VistaArticulos
        fields = ['codigo', 'nombre', 'stock', 'costo', 'rubro', 'subrubro', 'nromar', 'marca', 'imagenes']


class ArticulosSerializer(ArticulosBaseSerializer):
    pass


class ArticulosAutenticatedSerializer(ArticulosBaseSerializer):
    precio_final = serializers.SerializerMethodField()
    neto = serializers.SerializerMethodField()

    def get_precio_final(self, obj):
        contacto = self.context.get('contacto')
        if not contacto:
            return None
        lista1 = getattr(obj, 'lista1', None)
        valor = obj.precio if (contacto.nrolis == 0 or lista1 is None) else lista1
        return round(valor, 2) if valor is not None else None

    def get_neto(self, obj):
        return round(obj.neto, 2) if obj.neto is not None else None

    class Meta(ArticulosBaseSerializer.Meta):
        fields = ArticulosBaseSerializer.Meta.fields + ['precio_final', 'neto']


class ImagenesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Imagenes
        fields = '__all__'
