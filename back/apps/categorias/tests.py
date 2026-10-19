from unittest.mock import patch, MagicMock, call
from django.core.cache import cache

from rest_framework.test import APITestCase
from rest_framework import status


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_rubro(codigo=1, nombre='Rubro Test', verweb=True, nrodep='1'):
    obj = MagicMock()
    obj.codigo = codigo
    obj.nombre = nombre
    obj.verweb = verweb
    obj.nrodep = nrodep
    return obj


def make_subrubro(nrorub=1, codigo=1, nombre='Subrubro Test'):
    obj = MagicMock()
    obj.nrorub = nrorub
    obj.codigo = codigo
    obj.nombre = nombre
    return obj


def make_marca(codigo=1, nombre='Marca Test', verweb=True):
    obj = MagicMock()
    obj.codigo = codigo
    obj.nombre = nombre
    obj.verweb = verweb
    return obj


# ---------------------------------------------------------------------------
# TipoRubrosViewSet
# ---------------------------------------------------------------------------

class TipoRubrosViewSetTest(APITestCase):

    def setUp(self):
        cache.clear()

    @patch('apps.categorias.views.TipoRubros.objects')
    def test_list_returns_only_verweb_true(self, mock_objects):
        rubros = [make_rubro(codigo=1), make_rubro(codigo=2)]
        mock_objects.filter.return_value = rubros

        response = self.client.get('/api/tipo-rubros/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_objects.filter.assert_called_once_with(verweb=True)

    @patch('apps.categorias.views.TipoRubros.objects')
    def test_list_returns_empty_when_no_rubros(self, mock_objects):
        mock_objects.filter.return_value = []

        response = self.client.get('/api/tipo-rubros/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    @patch('apps.categorias.views.TipoRubros.objects')
    def test_list_does_not_require_authentication(self, mock_objects):
        mock_objects.filter.return_value = []

        # No credentials provided
        response = self.client.get('/api/tipo-rubros/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# TipoMarcasViewSet
# ---------------------------------------------------------------------------

class TipoMarcasViewSetTest(APITestCase):

    def setUp(self):
        cache.clear()

    @patch('apps.categorias.views.TipoMarcas.objects')
    def test_list_returns_only_verweb_true(self, mock_objects):
        marcas = [make_marca(codigo=1), make_marca(codigo=2)]
        mock_objects.filter.return_value = marcas

        response = self.client.get('/api/tipo-marcas/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_objects.filter.assert_called_once_with(verweb=True)

    @patch('apps.categorias.views.TipoMarcas.objects')
    def test_list_does_not_require_authentication(self, mock_objects):
        mock_objects.filter.return_value = []

        response = self.client.get('/api/tipo-marcas/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# TipoSubrubrosViewSet
# ---------------------------------------------------------------------------

class TipoSubrubrosViewSetTest(APITestCase):

    @patch('apps.categorias.views.TipoSubrubros.objects')
    def test_list_returns_all_subrubros(self, mock_objects):
        subrubros = [make_subrubro(nrorub=1, codigo=1), make_subrubro(nrorub=1, codigo=2)]
        mock_objects.all.return_value = subrubros

        response = self.client.get('/api/tipo-subrubros/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('apps.categorias.views.get_object_or_404')
    def test_retrieve_with_composite_key(self, mock_get_or_404):
        sub = make_subrubro(nrorub=2, codigo=5)
        mock_get_or_404.return_value = sub

        response = self.client.get('/api/tipo-subrubros/2-5/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_get_or_404.assert_called_once_with(
            # any TipoSubrubros, nrorub='2', codigo='5'
            mock_get_or_404.call_args[0][0],
            nrorub='2',
            codigo='5',
        )


# ---------------------------------------------------------------------------
# TipoRubrosWithSubrubrosViewSet
# ---------------------------------------------------------------------------

class TipoRubrosWithSubrubrosViewSetTest(APITestCase):

    def setUp(self):
        cache.clear()

    @patch('apps.categorias.views.TipoSubrubros.objects')
    @patch('apps.categorias.views.TipoRubros.objects')
    def test_list_includes_nested_subrubros(self, mock_rubros_objects, mock_subs_objects):
        rubro = make_rubro(codigo=1, nombre='Limpieza')
        mock_rubros_objects.filter.return_value = [rubro]

        sub = make_subrubro(nrorub=1, codigo=1, nombre='Detergentes')
        mock_subs_objects.filter.return_value = [sub]

        response = self.client.get('/api/tipo-rubros-con-subrubros/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # The view builds the nested structure manually
        data = response.data
        self.assertEqual(len(data), 1)
        self.assertIn('subrubros', data[0])

    @patch('apps.categorias.views.TipoSubrubros.objects')
    @patch('apps.categorias.views.TipoRubros.objects')
    def test_list_result_is_cached(self, mock_rubros_objects, mock_subs_objects):
        rubro = make_rubro(codigo=1)
        mock_rubros_objects.filter.return_value = [rubro]
        mock_subs_objects.filter.return_value = []

        # First request — should hit DB
        self.client.get('/api/tipo-rubros-con-subrubros/')
        # Second request — should come from cache (DB not called again)
        self.client.get('/api/tipo-rubros-con-subrubros/')

        # DB was queried exactly once despite two requests
        self.assertEqual(mock_rubros_objects.filter.call_count, 1)

    @patch('apps.categorias.views.TipoSubrubros.objects')
    @patch('apps.categorias.views.TipoRubros.objects')
    def test_list_does_not_require_authentication(self, mock_rubros_objects, mock_subs_objects):
        mock_rubros_objects.filter.return_value = []
        mock_subs_objects.filter.return_value = []

        response = self.client.get('/api/tipo-rubros-con-subrubros/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
