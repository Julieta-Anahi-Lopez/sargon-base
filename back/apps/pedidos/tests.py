from unittest.mock import patch, MagicMock, call
from datetime import datetime

from rest_framework.test import APITestCase
from rest_framework import status


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

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
    c.nroven = kwargs.get('nroven', 2)
    c.nrolis = kwargs.get('nrolis', 0)
    return c


def make_articulo(**kwargs):
    a = MagicMock()
    a.codigo = kwargs.get('codigo', 'ART001')
    a.nombre = kwargs.get('nombre', 'Articulo Test')
    return a


def make_pedido(**kwargs):
    p = MagicMock()
    p.compro = kwargs.get('compro', '0009-00000001')
    p.nrocli = kwargs.get('nrocli', 1)
    p.nroemp = kwargs.get('nroemp', 3)
    p.fecped = kwargs.get('fecped', datetime.now())
    p.nroven = kwargs.get('nroven', 2)
    p.nroest = kwargs.get('nroest', '3')
    return p


def _valid_payload():
    return {
        'detalle': [
            {'codigo': 'ART001', 'cantidad': 2, 'precio': 50.0},
        ]
    }


# ---------------------------------------------------------------------------
# PedidosCreateSerializer validation
# ---------------------------------------------------------------------------

class PedidosCreateSerializerTest(APITestCase):
    """Unit tests for input validation in PedidosCreateSerializer."""

    @patch('apps.pedidos.serializers.Articulos.objects')
    def test_valid_payload_passes(self, mock_art):
        from apps.pedidos.serializers import PedidosCreateSerializer

        mock_art.filter.return_value.first.return_value = make_articulo()

        serializer = PedidosCreateSerializer(data=_valid_payload())
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_empty_detalle_fails_validation(self):
        from apps.pedidos.serializers import PedidosCreateSerializer

        serializer = PedidosCreateSerializer(data={'detalle': []})
        self.assertFalse(serializer.is_valid())
        self.assertIn('detalle', serializer.errors)

    @patch('apps.pedidos.serializers.Articulos.objects')
    def test_nonexistent_article_code_fails(self, mock_art):
        from apps.pedidos.serializers import PedidoDetalleInputSerializer

        mock_art.filter.return_value.first.return_value = None

        serializer = PedidoDetalleInputSerializer(data={
            'codigo': 'INVALID', 'cantidad': 1, 'precio': 10.0
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('codigo', serializer.errors)

    @patch('apps.pedidos.serializers.Articulos.objects')
    def test_zero_quantity_fails(self, mock_art):
        from apps.pedidos.serializers import PedidoDetalleInputSerializer

        mock_art.filter.return_value.first.return_value = make_articulo()

        serializer = PedidoDetalleInputSerializer(data={
            'codigo': 'ART001', 'cantidad': 0, 'precio': 10.0
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('cantidad', serializer.errors)

    @patch('apps.pedidos.serializers.Articulos.objects')
    def test_negative_price_fails(self, mock_art):
        from apps.pedidos.serializers import PedidoDetalleInputSerializer

        mock_art.filter.return_value.first.return_value = make_articulo()

        serializer = PedidoDetalleInputSerializer(data={
            'codigo': 'ART001', 'cantidad': 1, 'precio': -5.0
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('precio', serializer.errors)

    @patch('apps.pedidos.serializers.Articulos.objects')
    def test_zero_price_passes(self, mock_art):
        from apps.pedidos.serializers import PedidoDetalleInputSerializer

        mock_art.filter.return_value.first.return_value = make_articulo()

        serializer = PedidoDetalleInputSerializer(data={
            'codigo': 'ART001', 'cantidad': 1, 'precio': 0.0
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)


# ---------------------------------------------------------------------------
# PedidosViewSet — create
# ---------------------------------------------------------------------------

class PedidosViewSetCreateTest(APITestCase):

    def setUp(self):
        self.user = make_web_usuario(codigo=1)
        self.client.force_authenticate(user=self.user)

    @patch('apps.pedidos.views.get_parametro')
    @patch('apps.pedidos.views.Contactos.objects')
    def test_create_returns_400_when_contact_not_found(self, mock_con, mock_param):
        mock_param.return_value = '9'
        mock_con.filter.return_value.first.return_value = None

        with patch('apps.pedidos.serializers.Articulos.objects') as mock_art:
            mock_art.filter.return_value.first.return_value = make_articulo()

            response = self.client.post('/api/pedidos/', _valid_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('apps.pedidos.views.get_parametro')
    @patch('apps.pedidos.views.VistaArticulos.objects')
    @patch('apps.pedidos.views.Contactos.objects')
    def test_create_returns_400_when_insufficient_stock(self, mock_con, mock_va, mock_param):
        mock_param.return_value = '9'
        contacto = make_contacto()
        mock_con.filter.return_value.first.return_value = contacto

        # Stock less than requested quantity
        art_stock = MagicMock()
        art_stock.codigo = 'ART001'
        art_stock.stock = 1.0  # only 1 in stock
        mock_va.filter.return_value = [art_stock]

        with patch('apps.pedidos.serializers.Articulos.objects') as mock_art:
            mock_art.filter.return_value.first.return_value = make_articulo()

            response = self.client.post('/api/pedidos/', {
                'detalle': [{'codigo': 'ART001', 'cantidad': 5, 'precio': 50.0}]
            }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('tipo'), 'stock_insuficiente')
        self.assertIn('items', response.data)

    @patch('apps.pedidos.views.get_parametro')
    @patch('apps.pedidos.views.VistaArticulos.objects')
    @patch('apps.pedidos.views.Contactos.objects')
    def test_create_returns_400_when_stock_is_none(self, mock_con, mock_va, mock_param):
        """Article exists in Articulos but not in VistaArticulos (stock=None)."""
        mock_param.return_value = '9'
        contacto = make_contacto()
        mock_con.filter.return_value.first.return_value = contacto
        mock_va.filter.return_value = []  # Not in vista — stock will be None

        with patch('apps.pedidos.serializers.Articulos.objects') as mock_art:
            mock_art.filter.return_value.first.return_value = make_articulo()

            response = self.client.post('/api/pedidos/', {
                'detalle': [{'codigo': 'ART001', 'cantidad': 1, 'precio': 50.0}]
            }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('tipo'), 'stock_insuficiente')

    @patch('apps.pedidos.views.PedidosDetalle.objects')
    @patch('apps.pedidos.views.Pedidos.objects')
    @patch('apps.pedidos.views.Articulos.objects')
    @patch('apps.pedidos.views.get_parametro')
    @patch('apps.pedidos.views.VistaArticulos.objects')
    @patch('apps.pedidos.views.Contactos.objects')
    def test_create_success(self, mock_con, mock_va, mock_param, mock_art,
                            mock_pedidos, mock_det):
        mock_param.side_effect = lambda aplica, codigo, default=None: (
            '9' if codigo == 1 else '3'
        )

        contacto = make_contacto()
        mock_con.filter.return_value.first.return_value = contacto

        art_stock = MagicMock()
        art_stock.codigo = 'ART001'
        art_stock.stock = 10.0
        mock_va.filter.return_value = [art_stock]

        # No existing pedidos → nuevo_numero = 1
        mock_pedidos.filter.return_value.select_for_update.return_value \
            .order_by.return_value.first.return_value = None

        pedido = make_pedido(compro='0009-00000001')
        mock_pedidos.get_or_create.return_value = (pedido, True)

        articulo = make_articulo()
        mock_art.filter.return_value.first.return_value = articulo

        with patch('apps.pedidos.serializers.Articulos.objects') as mock_art_ser:
            mock_art_ser.filter.return_value.first.return_value = make_articulo()

            response = self.client.post('/api/pedidos/', {
                'detalle': [{'codigo': 'ART001', 'cantidad': 2, 'precio': 50.0}]
            }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @patch('apps.pedidos.views.Pedidos.objects')
    @patch('apps.pedidos.views.Articulos.objects')
    @patch('apps.pedidos.views.get_parametro')
    @patch('apps.pedidos.views.VistaArticulos.objects')
    @patch('apps.pedidos.views.Contactos.objects')
    def test_create_returns_400_when_pedido_already_exists(self, mock_con, mock_va,
                                                            mock_param, mock_art,
                                                            mock_pedidos):
        mock_param.side_effect = lambda aplica, codigo, default=None: (
            '9' if codigo == 1 else '3'
        )
        contacto = make_contacto()
        mock_con.filter.return_value.first.return_value = contacto

        art_stock = MagicMock()
        art_stock.codigo = 'ART001'
        art_stock.stock = 10.0
        mock_va.filter.return_value = [art_stock]

        mock_pedidos.filter.return_value.select_for_update.return_value \
            .order_by.return_value.first.return_value = None

        pedido = make_pedido()
        mock_pedidos.get_or_create.return_value = (pedido, False)  # creado=False

        mock_art.filter.return_value.first.return_value = make_articulo()

        with patch('apps.pedidos.serializers.Articulos.objects') as mock_art_ser:
            mock_art_ser.filter.return_value.first.return_value = make_articulo()

            response = self.client.post('/api/pedidos/', {
                'detalle': [{'codigo': 'ART001', 'cantidad': 2, 'precio': 50.0}]
            }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ya existe', response.data.get('error', '').lower())


# ---------------------------------------------------------------------------
# PedidosPorUsuarioView
# ---------------------------------------------------------------------------

class PedidosPorUsuarioViewTest(APITestCase):

    def setUp(self):
        self.user = make_web_usuario(codigo=1)
        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/pedidos/usuario/mis-pedidos/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_list_returns_only_user_pedidos(self, mock_pedidos):
        mock_qs = MagicMock()
        mock_qs.filter.return_value = mock_qs
        mock_qs.order_by.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_qs.count.return_value = 0
        mock_pedidos.filter.return_value = mock_qs

        response = self.client.get('/api/pedidos/usuario/mis-pedidos/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_pedidos.filter.assert_called_once_with(nrocli=self.user.codigo)

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_invalid_fecha_desde_format_returns_400(self, mock_pedidos):
        mock_qs = MagicMock()
        mock_qs.filter.return_value = mock_qs
        mock_pedidos.filter.return_value = mock_qs

        response = self.client.get('/api/pedidos/usuario/mis-pedidos/?fecha_desde=31-12-2024')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('fecha_desde', response.data.get('error', ''))

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_invalid_fecha_hasta_format_returns_400(self, mock_pedidos):
        mock_qs = MagicMock()
        mock_qs.filter.return_value = mock_qs
        mock_pedidos.filter.return_value = mock_qs

        response = self.client.get('/api/pedidos/usuario/mis-pedidos/?fecha_hasta=bad-date')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_filter_by_estado(self, mock_pedidos):
        mock_qs = MagicMock()
        mock_qs.filter.return_value = mock_qs
        mock_qs.order_by.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_qs.count.return_value = 0
        mock_pedidos.filter.return_value = mock_qs

        self.client.get('/api/pedidos/usuario/mis-pedidos/?estado=3')

        mock_qs.filter.assert_any_call(nroest='3')

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_filter_by_comprobante(self, mock_pedidos):
        mock_qs = MagicMock()
        mock_qs.filter.return_value = mock_qs
        mock_qs.order_by.return_value = mock_qs
        mock_qs.__iter__ = lambda self: iter([])
        mock_qs.count.return_value = 0
        mock_pedidos.filter.return_value = mock_qs

        self.client.get('/api/pedidos/usuario/mis-pedidos/?comprobante=0009-00000001')

        mock_qs.filter.assert_any_call(compro__icontains='0009-00000001')


# ---------------------------------------------------------------------------
# PedidoDetalleUsuarioView
# ---------------------------------------------------------------------------

class PedidoDetalleUsuarioViewTest(APITestCase):

    def setUp(self):
        self.user = make_web_usuario(codigo=1)
        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/pedidos/usuario/mis-pedidos/0009-00000001/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_returns_pedido_that_belongs_to_user(self, mock_pedidos):
        pedido = make_pedido(compro='0009-00000001', nrocli=1)
        mock_pedidos.get.return_value = pedido

        response = self.client.get('/api/pedidos/usuario/mis-pedidos/0009-00000001/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_pedidos.get.assert_called_once_with(
            compro='0009-00000001', nrocli=self.user.codigo
        )

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_returns_404_when_pedido_not_found(self, mock_pedidos):
        from apps.pedidos.models import Pedidos
        mock_pedidos.get.side_effect = Pedidos.DoesNotExist

        response = self.client.get('/api/pedidos/usuario/mis-pedidos/NOTEXIST/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_returns_404_when_pedido_belongs_to_other_user(self, mock_pedidos):
        from apps.pedidos.models import Pedidos
        # The view filters by nrocli=user.codigo, so another user's order won't be found
        mock_pedidos.get.side_effect = Pedidos.DoesNotExist

        self.user.codigo = 99  # different user
        response = self.client.get('/api/pedidos/usuario/mis-pedidos/0009-00000001/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ---------------------------------------------------------------------------
# ResumenPedidosUsuarioView
# ---------------------------------------------------------------------------

class ResumenPedidosUsuarioViewTest(APITestCase):

    def setUp(self):
        self.user = make_web_usuario(codigo=1)
        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/pedidos/usuario/mis-pedidos-resumen/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.pedidos.views_usuarios.Pedidos.objects')
    def test_returns_summary_with_correct_fields(self, mock_pedidos):
        mock_qs = MagicMock()
        mock_qs.filter.return_value = mock_qs
        mock_qs.count.return_value = 5
        mock_pedidos.filter.return_value = mock_qs

        response = self.client.get('/api/pedidos/usuario/mis-pedidos-resumen/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_pedidos', response.data)
        self.assertIn('pedidos_recientes', response.data)
        self.assertIn('cliente', response.data)
        self.assertEqual(response.data['cliente']['codigo'], self.user.codigo)
