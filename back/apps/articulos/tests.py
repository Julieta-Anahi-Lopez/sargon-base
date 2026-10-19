from unittest.mock import patch, MagicMock, PropertyMock
from django.core.cache import cache

from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status

from apps.articulos.pagination import ArticulosPagination
from apps.articulos.serializers import (
    ArticulosBaseSerializer,
    ArticulosAutenticatedSerializer,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_articulo(**kwargs):
    obj = MagicMock()
    obj.codigo = kwargs.get('codigo', 'ART001')
    obj.nombre = kwargs.get('nombre', 'Articulo Test')
    obj.stock = kwargs.get('stock', 10.0)
    obj.costo = kwargs.get('costo', 50.0)
    obj.rubro = kwargs.get('rubro', 1)
    obj.subrubro = kwargs.get('subrubro', 1)
    obj.nromar = kwargs.get('nromar', 1)
    obj.marca = kwargs.get('marca', 'Marca Test')
    obj.precio = kwargs.get('precio', 100.0)
    obj.imagenes_cache = kwargs.get('imagenes_cache', [])
    return obj


def make_imagen(codimg='ART001', nomarc='foto.jpg'):
    obj = MagicMock()
    obj.codimg = codimg
    obj.nomarc = nomarc
    return obj


def make_web_usuario(**kwargs):
    user = MagicMock()
    user.codigo = kwargs.get('codigo', 1)
    user.nombre = kwargs.get('nombre', 'Test User')
    user.e_mail = kwargs.get('e_mail', 'test@example.com')
    user.is_authenticated = True
    user.is_anonymous = False
    return user


def make_contacto(**kwargs):
    c = MagicMock()
    c.nrocon = kwargs.get('nrocon', 1)
    c.nrolis = kwargs.get('nrolis', 0)
    return c


# ---------------------------------------------------------------------------
# ArticulosPagination
# ---------------------------------------------------------------------------

class ArticulosPaginationTest(APITestCase):

    def test_get_paginated_response_structure(self):
        factory = APIRequestFactory()
        request = factory.get('/api/articulos/')

        paginator = ArticulosPagination()
        # Simulate paginating a list of 3 items with page_size=2
        paginator.page_size = 2
        from django.core.paginator import Paginator, Page
        paginator_obj = Paginator([1, 2, 3], 2)
        paginator.page = paginator_obj.page(1)
        paginator.request = request

        response = paginator.get_paginated_response(['item1', 'item2'])
        data = response.data

        self.assertIn('count', data)
        self.assertIn('total_pages', data)
        self.assertIn('current_page', data)
        self.assertIn('page_size', data)
        self.assertIn('next', data)
        self.assertIn('previous', data)
        self.assertIn('results', data)

    def test_count_uses_codigo_values(self):
        mock_qs = MagicMock()
        mock_qs.values.return_value.count.return_value = 5

        paginator = ArticulosPagination()
        count = paginator.get_count(mock_qs)

        self.assertEqual(count, 5)
        mock_qs.values.assert_called_once_with('codigo')

    def test_count_falls_back_to_len_on_error(self):
        mock_qs = MagicMock()
        mock_qs.values.side_effect = AttributeError

        paginator = ArticulosPagination()
        count = paginator.get_count([1, 2, 3])

        self.assertEqual(count, 3)


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class ArticulosBaseSerializerTest(APITestCase):

    def _make_serializer(self, obj, request=None):
        context = {'request': request} if request else {}
        return ArticulosBaseSerializer(obj, context=context)

    def test_get_imagenes_returns_empty_when_no_cache(self):
        art = make_articulo(imagenes_cache=[])
        serializer = self._make_serializer(art)
        result = serializer.get_imagenes(art)
        self.assertEqual(result, [])

    def test_get_imagenes_builds_url_per_image(self):
        img1 = make_imagen(nomarc='foto1.jpg')
        img2 = make_imagen(nomarc='foto2.jpg')
        art = make_articulo(imagenes_cache=[img1, img2])

        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = self._make_serializer(art, request=request)

        result = serializer.get_imagenes(art)
        self.assertEqual(len(result), 1)  # One dict with all photos
        self.assertIn('foto_1', result[0])
        self.assertIn('foto_2', result[0])
        self.assertIn('foto1.jpg', result[0]['foto_1'])
        self.assertIn('foto2.jpg', result[0]['foto_2'])

    def test_get_imagenes_uses_media_url_without_request(self):
        img = make_imagen(nomarc='foto.jpg')
        art = make_articulo(imagenes_cache=[img])
        serializer = self._make_serializer(art, request=None)

        result = serializer.get_imagenes(art)
        self.assertIn('/media/', result[0]['foto_1'])


class ArticulosAutenticatedSerializerTest(APITestCase):

    def _make_serializer(self, obj, contacto=None):
        context = {'contacto': contacto}
        return ArticulosAutenticatedSerializer(obj, context=context)

    def test_precio_final_is_none_when_no_contacto(self):
        art = make_articulo(precio=100.0)
        serializer = self._make_serializer(art, contacto=None)
        result = serializer.get_precio_final(art)
        self.assertIsNone(result)

    def test_precio_final_uses_precio_for_nrolis_zero(self):
        contacto = make_contacto(nrolis=0)
        art = make_articulo(precio=100.0)
        art.lista1 = 120.0
        serializer = self._make_serializer(art, contacto=contacto)
        result = serializer.get_precio_final(art)
        self.assertEqual(result, 100.0)

    def test_precio_final_uses_lista1_for_nrolis_one(self):
        contacto = make_contacto(nrolis=1)
        art = make_articulo(precio=100.0)
        art.lista1 = 120.0
        serializer = self._make_serializer(art, contacto=contacto)
        result = serializer.get_precio_final(art)
        self.assertEqual(result, 120.0)


# ---------------------------------------------------------------------------
# ArticulosViewSet
# ---------------------------------------------------------------------------

class ArticulosViewSetGetQuerysetTest(APITestCase):
    """Tests for the get_queryset filtering logic."""

    def setUp(self):
        cache.clear()

    def _patch_qs(self, patch_target='apps.articulos.views.VistaArticulos.objects'):
        """Returns a mock that chains filter() and order_by() calls."""
        patcher = patch(patch_target)
        mock_objects = patcher.start()
        self.addCleanup(patcher.stop)

        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_objects.order_by.return_value = mock_qs
        return mock_qs

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_filter_by_rubro(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        self.client.get('/api/articulos/?nrogru=3')

        mock_qs.filter.assert_any_call(rubro='3')

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_filter_by_subrubro(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        self.client.get('/api/articulos/?nrosub=5')

        mock_qs.filter.assert_any_call(subrubro='5')

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_filter_by_marca(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        self.client.get('/api/articulos/?nromar=6')

        mock_qs.filter.assert_any_call(nromar='6')

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_filter_by_precio_range(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        self.client.get('/api/articulos/?precio_min=10&precio_max=50')

        mock_qs.filter.assert_any_call(precio__gte='10')
        mock_qs.filter.assert_any_call(precio__lte='50')

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_filter_by_nombre(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        self.client.get('/api/articulos/?nombre=yerba')

        mock_qs.filter.assert_any_call(nombre__icontains='yerba')

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_filter_by_codigo(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        self.client.get('/api/articulos/?codigo=ART')

        mock_qs.filter.assert_any_call(codigo__icontains='ART')

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_no_filters_applied_when_no_params(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        self.client.get('/api/articulos/')

        mock_qs.filter.assert_not_called()


class ArticulosViewSetCacheTest(APITestCase):
    """Tests for the caching logic in the list endpoint."""

    def setUp(self):
        cache.clear()

    @patch('apps.articulos.views.Contactos.objects')
    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_navigation_params_are_cached(self, mock_va, mock_img, mock_con):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        # First request hits DB
        self.client.get('/api/articulos/?nrogru=1')
        # Second identical request should be served from cache
        self.client.get('/api/articulos/?nrogru=1')

        # VistaArticulos.objects.order_by called once (cache hit on 2nd request)
        self.assertEqual(mock_va.order_by.call_count, 1)

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_free_search_params_are_not_cached(self, mock_va, mock_img):
        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        # Both requests with free-search param → both hit DB
        self.client.get('/api/articulos/?nombre=yerba')
        self.client.get('/api/articulos/?nombre=yerba')

        self.assertEqual(mock_va.order_by.call_count, 2)


class ArticulosViewSetAttachImagenesTest(APITestCase):
    """Tests for the N+1-avoiding _attach_imagenes helper."""

    def test_attach_imagenes_groups_by_codigo(self):
        from apps.articulos.views import ArticulosViewSet
        viewset = ArticulosViewSet()

        art1 = make_articulo(codigo='A1')
        art2 = make_articulo(codigo='A2')
        img1 = make_imagen(codimg='A1', nomarc='a1.jpg')
        img2 = make_imagen(codimg='A2', nomarc='a2.jpg')

        with patch('apps.articulos.views.Imagenes.objects') as mock_img:
            mock_img.filter.return_value = [img1, img2]
            viewset._attach_imagenes([art1, art2])

        self.assertEqual(art1.imagenes_cache, [img1])
        self.assertEqual(art2.imagenes_cache, [img2])

    def test_attach_imagenes_uses_single_query(self):
        from apps.articulos.views import ArticulosViewSet
        viewset = ArticulosViewSet()

        arts = [make_articulo(codigo=f'A{i}') for i in range(5)]

        with patch('apps.articulos.views.Imagenes.objects') as mock_img:
            mock_img.filter.return_value = []
            viewset._attach_imagenes(arts)

        # Only ONE DB query for all 5 articles
        mock_img.filter.assert_called_once()
        call_args = mock_img.filter.call_args
        self.assertIn('codimg__in', call_args.kwargs)
        self.assertEqual(len(call_args.kwargs['codimg__in']), 5)

    def test_attach_imagenes_sets_empty_cache_when_no_images(self):
        from apps.articulos.views import ArticulosViewSet
        viewset = ArticulosViewSet()

        art = make_articulo(codigo='NOIMG')

        with patch('apps.articulos.views.Imagenes.objects') as mock_img:
            mock_img.filter.return_value = []
            viewset._attach_imagenes([art])

        self.assertEqual(art.imagenes_cache, [])


class ArticulosViewSetGetSerializerClassTest(APITestCase):
    """Tests for the get_serializer_class selector."""

    def setUp(self):
        cache.clear()

    @patch('apps.articulos.views.Imagenes.objects')
    @patch('apps.articulos.views.VistaArticulos.objects')
    def test_authenticated_user_gets_authenticated_serializer(self, mock_va, mock_img):
        from apps.articulos.serializers import ArticulosAutenticatedSerializer

        mock_qs = MagicMock()
        mock_qs.order_by.return_value = mock_qs
        mock_qs.filter.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_va.order_by.return_value = mock_qs
        mock_img.filter.return_value = []

        user = make_web_usuario()
        self.client.force_authenticate(user=user)

        from apps.articulos.views import ArticulosViewSet
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory

        factory = APIRequestFactory()
        raw_request = factory.get('/api/articulos/')
        raw_request.user = user

        viewset = ArticulosViewSet()
        viewset.request = Request(raw_request)
        self.assertIs(viewset.get_serializer_class(), ArticulosAutenticatedSerializer)

    def test_anonymous_user_gets_base_serializer(self):
        from apps.articulos.serializers import ArticulosSerializer
        from apps.articulos.views import ArticulosViewSet
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory
        from django.contrib.auth.models import AnonymousUser

        factory = APIRequestFactory()
        raw_request = factory.get('/api/articulos/')
        raw_request.user = AnonymousUser()

        viewset = ArticulosViewSet()
        viewset.request = Request(raw_request)
        self.assertIs(viewset.get_serializer_class(), ArticulosSerializer)


class ArticulosViewSetBuildCacheKeyTest(APITestCase):
    """Tests for _build_cache_key and _get_nrolis_for_cache."""

    def _make_viewset_with_request(self, url='/api/articulos/', user=None):
        from apps.articulos.views import ArticulosViewSet
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory
        from django.contrib.auth.models import AnonymousUser

        factory = APIRequestFactory()
        raw_request = factory.get(url)
        raw_request.user = user or AnonymousUser()

        viewset = ArticulosViewSet()
        viewset.request = Request(raw_request)
        return viewset

    def test_returns_none_when_nombre_param_present(self):
        viewset = self._make_viewset_with_request('/api/articulos/?nombre=yerba')
        key = viewset._build_cache_key(viewset.request, 'anon')
        self.assertIsNone(key)

    def test_returns_none_when_codigo_param_present(self):
        viewset = self._make_viewset_with_request('/api/articulos/?codigo=ART001')
        key = viewset._build_cache_key(viewset.request, 'anon')
        self.assertIsNone(key)

    def test_returns_key_for_navigation_params(self):
        viewset = self._make_viewset_with_request('/api/articulos/?nrogru=1&page=2')
        key = viewset._build_cache_key(viewset.request, 'anon')
        self.assertIsNotNone(key)
        self.assertIn('articulos_anon_', key)

    def test_same_params_different_order_produce_same_key(self):
        v1 = self._make_viewset_with_request('/api/articulos/?nrogru=1&page=2')
        v2 = self._make_viewset_with_request('/api/articulos/?page=2&nrogru=1')
        key1 = v1._build_cache_key(v1.request, 'anon')
        key2 = v2._build_cache_key(v2.request, 'anon')
        self.assertEqual(key1, key2)

    def test_different_nrolis_produce_different_keys(self):
        viewset = self._make_viewset_with_request('/api/articulos/?nrogru=1')
        key0 = viewset._build_cache_key(viewset.request, '0')
        key1 = viewset._build_cache_key(viewset.request, '1')
        self.assertNotEqual(key0, key1)

    @patch('apps.articulos.views.Contactos.objects')
    def test_get_nrolis_returns_anon_for_unauthenticated(self, mock_con):
        from apps.articulos.views import ArticulosViewSet
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory
        from django.contrib.auth.models import AnonymousUser

        factory = APIRequestFactory()
        raw_request = factory.get('/')
        raw_request.user = AnonymousUser()

        viewset = ArticulosViewSet()
        viewset.request = Request(raw_request)

        result = viewset._get_nrolis_for_cache()
        self.assertEqual(result, 'anon')

    @patch('apps.articulos.views.Contactos.objects')
    def test_get_nrolis_returns_contacto_nrolis_for_authenticated_user(self, mock_con):
        from apps.articulos.views import ArticulosViewSet
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory

        contacto = make_contacto(nrolis=1)
        mock_con.filter.return_value.first.return_value = contacto

        user = make_web_usuario(codigo=42)
        factory = APIRequestFactory()
        raw_request = factory.get('/')
        raw_request.user = user

        viewset = ArticulosViewSet()
        viewset.request = Request(raw_request)

        cache.clear()
        result = viewset._get_nrolis_for_cache()
        self.assertEqual(result, '1')
