from unittest.mock import patch, MagicMock, call

from django.test import TestCase
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
    user.clave = kwargs.get('clave', 'pass123')
    user.catusu = kwargs.get('catusu', 'C')
    user.gposeg = kwargs.get('gposeg', 0)
    user.telcel = kwargs.get('telcel', '291 123456')
    user.nrodoc = kwargs.get('nrodoc', '12345678')
    user.is_authenticated = True
    user.is_anonymous = False
    return user


def make_contacto(**kwargs):
    c = MagicMock()
    c.nrocon = kwargs.get('nrocon', 1)
    c.nombre = kwargs.get('nombre', 'Test User')
    c.domcal = kwargs.get('domcal', 'Av. Colon')
    c.domnro = kwargs.get('domnro', '100')
    c.cuit = kwargs.get('cuit', '20-12345678-9')
    c.nrodoc = kwargs.get('nrodoc', '12345678')
    c.cativa = kwargs.get('cativa', '4')  # Consumidor Final
    c.nroven = kwargs.get('nroven', 1)
    c.nrolis = kwargs.get('nrolis', 0)
    c.nroemp = kwargs.get('nroemp', 1)
    c.e_mail = kwargs.get('e_mail', 'test@example.com')
    c.telcel = kwargs.get('telcel', '291 123456')
    return c


# ---------------------------------------------------------------------------
# LoginView
# ---------------------------------------------------------------------------

class LoginViewTest(APITestCase):

    @patch('apps.users.views.Contactos.objects')
    @patch('apps.users.views.WebUsuarios.objects')
    def test_login_success_returns_tokens_and_user_data(self, mock_wu, mock_con):
        user = make_web_usuario(cativa='4')
        mock_wu.get.return_value = user

        contacto = make_contacto(cativa='4')
        mock_con.get.return_value = contacto

        response = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'clave': 'pass123',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_login_missing_email_returns_400(self):
        response = self.client.post('/api/auth/login/', {'clave': 'pass123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_login_missing_clave_returns_400(self):
        response = self.client.post('/api/auth/login/', {'email': 'test@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('apps.users.views.WebUsuarios.objects')
    def test_login_wrong_password_returns_401(self, mock_wu):
        user = make_web_usuario(clave='correct')
        mock_wu.get.return_value = user

        response = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'clave': 'wrongpassword',
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    @patch('apps.users.views.WebUsuarios.objects')
    def test_login_user_not_found_returns_401(self, mock_wu):
        from apps.users.models import WebUsuarios
        mock_wu.get.side_effect = WebUsuarios.DoesNotExist

        response = self.client.post('/api/auth/login/', {
            'email': 'nobody@example.com',
            'clave': 'pass123',
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.users.views.Contactos.objects')
    @patch('apps.users.views.WebUsuarios.objects')
    def test_login_contact_not_found_returns_500(self, mock_wu, mock_con):
        from apps.users.models import Contactos
        user = make_web_usuario()
        mock_wu.get.return_value = user
        mock_con.get.side_effect = Contactos.DoesNotExist

        response = self.client.post('/api/auth/login/', {
            'email': 'test@example.com',
            'clave': 'pass123',
        })

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    @patch('apps.users.views.Contactos.objects')
    @patch('apps.users.views.WebUsuarios.objects')
    def test_login_cativa_mapping(self, mock_wu, mock_con):
        user = make_web_usuario()
        mock_wu.get.return_value = user

        cativa_cases = [
            ('1', 'Responsable Inscripto'),
            ('7', 'Monotributista'),
            ('4', 'Consumidor Final'),
            ('X', 'Otra'),
        ]

        for raw, expected in cativa_cases:
            contacto = make_contacto(cativa=raw)
            mock_con.get.return_value = contacto

            response = self.client.post('/api/auth/login/', {
                'email': 'test@example.com',
                'clave': 'pass123',
            })

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['user']['catIva'], expected, f'Failed for cativa={raw}')


# ---------------------------------------------------------------------------
# MeView
# ---------------------------------------------------------------------------

class MeViewTest(APITestCase):

    @patch('apps.users.views.Contactos.objects')
    def test_me_returns_user_and_contact_data(self, mock_con):
        user = make_web_usuario()
        contacto = make_contacto(cativa='1')
        mock_con.get.return_value = contacto

        self.client.force_authenticate(user=user)
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('codigo', response.data)
        self.assertIn('nombre', response.data)
        self.assertIn('email', response.data)
        self.assertIn('catIva', response.data)
        self.assertEqual(response.data['catIva'], 'Responsable Inscripto')

    def test_me_requires_authentication(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.users.views.Contactos.objects')
    def test_me_contact_not_found_returns_500(self, mock_con):
        from apps.users.models import Contactos
        user = make_web_usuario()
        mock_con.get.side_effect = Contactos.DoesNotExist

        self.client.force_authenticate(user=user)
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# WebUsuariosViewSet — create
# ---------------------------------------------------------------------------

class WebUsuariosViewSetCreateTest(APITestCase):
    """El endpoint POST /api/web-usuarios/ requiere catusu='V' (IsVendedor)."""

    def _auth_as_vendedor(self):
        vendedor = make_web_usuario(catusu='V')
        self.client.force_authenticate(user=vendedor)

    def test_create_without_authentication_returns_401(self):
        response = self.client.post('/api/web-usuarios/', {'e_mail': 'new@example.com'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_as_cliente_returns_403(self):
        cliente = make_web_usuario(catusu='C')
        self.client.force_authenticate(user=cliente)
        response = self.client.post('/api/web-usuarios/', {'e_mail': 'new@example.com'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_without_dni_returns_400(self):
        self._auth_as_vendedor()
        response = self.client.post('/api/web-usuarios/', {
            'e_mail': 'new@example.com',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_without_email_returns_400(self):
        self._auth_as_vendedor()
        response = self.client.post('/api/web-usuarios/', {
            'nrodoc': '99999999',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('apps.users.views.WebUsuarios.objects')
    def test_create_duplicate_dni_returns_400(self, mock_wu):
        self._auth_as_vendedor()
        mock_wu.filter.return_value.exists.return_value = True

        response = self.client.post('/api/web-usuarios/', {
            'nrodoc': '12345678',
            'e_mail': 'new@example.com',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('DNI', response.data['error'])

    @patch('apps.users.views.WebUsuarios.objects')
    def test_create_duplicate_email_returns_400(self, mock_wu):
        self._auth_as_vendedor()
        # First filter(nrodoc=...) → False, second filter(e_mail=...) → True
        mock_wu.filter.return_value.exists.side_effect = [False, True]

        response = self.client.post('/api/web-usuarios/', {
            'nrodoc': '99999999',
            'e_mail': 'existing@example.com',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['error'])


# ---------------------------------------------------------------------------
# WebUsuariosViewSet — permissions and queryset
# ---------------------------------------------------------------------------

class WebUsuariosViewSetPermissionsTest(APITestCase):

    def test_list_requires_authentication(self):
        response = self.client.get('/api/web-usuarios/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('apps.users.views.WebUsuarios.objects')
    def test_list_returns_only_own_record(self, mock_wu):
        user = make_web_usuario(codigo=42)
        own_record = make_web_usuario(codigo=42)
        mock_wu.filter.return_value = [own_record]

        self.client.force_authenticate(user=user)
        self.client.get('/api/web-usuarios/')

        mock_wu.filter.assert_called_with(codigo=42)

    @patch('apps.users.views.WebUsuarios.objects')
    def test_unauthenticated_get_queryset_returns_none(self, mock_wu):
        mock_wu.none.return_value = []

        # Anonymous access to list (will be blocked by IsAuthenticated, but we test
        # the queryset logic via the view's internal get_queryset)
        from apps.users.views import WebUsuariosViewSet
        from rest_framework.request import Request
        from rest_framework.test import APIRequestFactory
        from django.contrib.auth.models import AnonymousUser

        factory = APIRequestFactory()
        raw = factory.get('/')
        raw.user = AnonymousUser()

        viewset = WebUsuariosViewSet()
        viewset.request = Request(raw)
        viewset.action = 'list'

        result = viewset.get_queryset()
        mock_wu.none.assert_called_once()


# ---------------------------------------------------------------------------
# WebUsuariosViewSet — _es_localidad_lista_cero
# ---------------------------------------------------------------------------

class LocalidadListaZeroTest(TestCase):

    def setUp(self):
        from apps.users.views import WebUsuariosViewSet
        self.viewset = WebUsuariosViewSet()

    def test_bahia_blanca_is_lista_zero(self):
        self.assertTrue(self.viewset._es_localidad_lista_cero('8000'))

    def test_punta_alta_is_lista_zero(self):
        self.assertTrue(self.viewset._es_localidad_lista_cero('8109'))

    def test_buenos_aires_capital_is_not_lista_zero(self):
        self.assertFalse(self.viewset._es_localidad_lista_cero('1000'))

    def test_unknown_cp_is_not_lista_zero(self):
        self.assertFalse(self.viewset._es_localidad_lista_cero('9999'))

    def test_integer_cp_is_coerced_to_string(self):
        # The method uses str(codigo_postal), so passing an int should work
        self.assertTrue(self.viewset._es_localidad_lista_cero(8000))


# ---------------------------------------------------------------------------
# WebUsuariosViewSet — _crear_contacto validations
# ---------------------------------------------------------------------------

class CrearContactoValidationTest(TestCase):

    def setUp(self):
        from apps.users.views import WebUsuariosViewSet
        self.viewset = WebUsuariosViewSet()

    @patch('apps.users.views.Contactos.objects')
    def test_raises_if_locali_missing(self, mock_con):
        mock_con.all.return_value.order_by.return_value.first.return_value = MagicMock(nrocon=100)
        with self.assertRaises(ValueError) as ctx:
            self.viewset._crear_contacto({'nrodoc': '123', 'e_mail': 'a@b.com', 'cativa': 'CF'})
        self.assertIn('localidad', str(ctx.exception))

    @patch('apps.users.views.Contactos.objects')
    def test_raises_if_nrodoc_missing(self, mock_con):
        mock_con.all.return_value.order_by.return_value.first.return_value = MagicMock(nrocon=100)
        with self.assertRaises(ValueError) as ctx:
            self.viewset._crear_contacto({'locali': '8000', 'e_mail': 'a@b.com', 'cativa': 'CF'})
        self.assertIn('DNI', str(ctx.exception))

    @patch('apps.users.views.Contactos.objects')
    def test_raises_if_email_missing(self, mock_con):
        mock_con.all.return_value.order_by.return_value.first.return_value = MagicMock(nrocon=100)
        with self.assertRaises(ValueError) as ctx:
            self.viewset._crear_contacto({'locali': '8000', 'nrodoc': '123', 'cativa': 'CF'})
        self.assertIn('email', str(ctx.exception))

    @patch('apps.users.views.Contactos.objects')
    def test_returns_existing_contact_when_nrodoc_already_exists(self, mock_con):
        existing = make_contacto(nrodoc='12345678')
        mock_con.filter.return_value.exists.return_value = True
        mock_con.get.return_value = existing

        result = self.viewset._crear_contacto({
            'locali': '8000',
            'nrodoc': '12345678',
            'e_mail': 'x@x.com',
            'cativa': 'CF',
        })

        self.assertEqual(result, existing)

    @patch('apps.users.views.Contactos.objects')
    def test_assigns_lista_zero_for_local_cp(self, mock_con):
        # Bahia Blanca CP → nrolis = 0
        new_contacto = make_contacto(nrolis=0)
        mock_con.filter.return_value.exists.return_value = False  # no duplicate DNI
        mock_con.all.return_value.order_by.return_value.first.return_value = MagicMock(nrocon=100)
        mock_con.get_or_create.return_value = (new_contacto, True)

        self.viewset._crear_contacto({
            'locali': '8000',
            'nrodoc': '11111111',
            'e_mail': 'x@x.com',
            'cativa': 'CF',
        })

        # get_or_create was called with nrolis=0
        call_kwargs = mock_con.get_or_create.call_args.kwargs
        self.assertEqual(call_kwargs.get('nrolis'), 0)

    @patch('apps.users.views.Contactos.objects')
    def test_assigns_lista_one_for_non_local_cp(self, mock_con):
        new_contacto = make_contacto(nrolis=1)
        mock_con.filter.return_value.exists.return_value = False
        mock_con.all.return_value.order_by.return_value.first.return_value = MagicMock(nrocon=100)
        mock_con.get_or_create.return_value = (new_contacto, True)

        self.viewset._crear_contacto({
            'locali': '1000',  # Buenos Aires — not in lista 0
            'nrodoc': '22222222',
            'e_mail': 'y@y.com',
            'cativa': 'CF',
        })

        call_kwargs = mock_con.get_or_create.call_args.kwargs
        self.assertEqual(call_kwargs.get('nrolis'), 1)


# ---------------------------------------------------------------------------
# WebUsuariosCreateUpdateSerializer — clave validation
# ---------------------------------------------------------------------------

class WebUsuariosSerializerClaveTest(TestCase):

    def _get_serializer(self, clave):
        from apps.users.serializers import WebUsuariosCreateUpdateSerializer
        data = {'clave': clave, 'codigo': 1, 'nombre': 'X', 'catusu': 'C',
                'nrodoc': '123', 'e_mail': 'x@x.com'}
        return WebUsuariosCreateUpdateSerializer(data=data)

    def test_clave_too_short_raises_validation_error(self):
        from apps.users.serializers import WebUsuariosCreateUpdateSerializer
        from rest_framework.exceptions import ValidationError
        serializer = WebUsuariosCreateUpdateSerializer()
        with self.assertRaises(ValidationError):
            serializer.validate_clave('abc')

    def test_clave_too_long_raises_validation_error(self):
        from apps.users.serializers import WebUsuariosCreateUpdateSerializer
        from rest_framework.exceptions import ValidationError
        serializer = WebUsuariosCreateUpdateSerializer()
        with self.assertRaises(ValidationError):
            serializer.validate_clave('toolongpass')

    def test_clave_valid_length_passes(self):
        from apps.users.serializers import WebUsuariosCreateUpdateSerializer
        serializer = WebUsuariosCreateUpdateSerializer()
        result = serializer.validate_clave('valid12')
        self.assertEqual(result, 'valid12')

    def test_clave_exactly_six_chars_passes(self):
        from apps.users.serializers import WebUsuariosCreateUpdateSerializer
        serializer = WebUsuariosCreateUpdateSerializer()
        result = serializer.validate_clave('abcdef')
        self.assertEqual(result, 'abcdef')

    def test_clave_exactly_eight_chars_passes(self):
        from apps.users.serializers import WebUsuariosCreateUpdateSerializer
        serializer = WebUsuariosCreateUpdateSerializer()
        result = serializer.validate_clave('abcdefgh')
        self.assertEqual(result, 'abcdefgh')


# ---------------------------------------------------------------------------
# CustomTokenRefreshSerializer
# ---------------------------------------------------------------------------

class CustomTokenRefreshSerializerTest(TestCase):

    @patch('apps.users.serializers.WebUsuarios.objects')
    def test_valid_refresh_token_returns_access_token(self, mock_wu):
        from rest_framework_simplejwt.tokens import RefreshToken
        from apps.users.serializers import CustomTokenRefreshSerializer

        user = make_web_usuario(codigo=1)
        mock_wu.get.return_value = user

        refresh = RefreshToken.for_user(user)
        serializer = CustomTokenRefreshSerializer(data={'refresh': str(refresh)})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertIn('access', serializer.validated_data)

    @patch('apps.users.serializers.WebUsuarios.objects')
    def test_invalid_user_raises_validation_error(self, mock_wu):
        from rest_framework_simplejwt.tokens import RefreshToken
        from apps.users.serializers import CustomTokenRefreshSerializer
        from apps.users.models import WebUsuarios

        user = make_web_usuario(codigo=999)
        mock_wu.get.side_effect = WebUsuarios.DoesNotExist

        refresh = RefreshToken.for_user(user)
        serializer = CustomTokenRefreshSerializer(data={'refresh': str(refresh)})
        self.assertFalse(serializer.is_valid())

    def test_garbage_token_raises_validation_error(self):
        from apps.users.serializers import CustomTokenRefreshSerializer

        serializer = CustomTokenRefreshSerializer(data={'refresh': 'not-a-real-token'})
        self.assertFalse(serializer.is_valid())


# ---------------------------------------------------------------------------
# CustomAuth
# ---------------------------------------------------------------------------

class CustomAuthTest(TestCase):

    def _make_request(self, token_header=None):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        if token_header:
            request.META['HTTP_AUTHORIZATION'] = token_header
        return request

    def test_no_auth_header_returns_none(self):
        from apps.users.auth import CustomAuth

        auth = CustomAuth()
        request = self._make_request()
        result = auth.authenticate(request)
        self.assertIsNone(result)

    @patch('apps.users.auth.WebUsuarios.objects')
    def test_valid_token_returns_user_and_token(self, mock_wu):
        from rest_framework_simplejwt.tokens import RefreshToken
        from apps.users.auth import CustomAuth

        user = make_web_usuario(codigo=1)
        mock_wu.get.return_value = user

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        auth = CustomAuth()
        request = self._make_request(token_header=f'Bearer {access}')
        result = auth.authenticate(request)

        self.assertIsNotNone(result)
        returned_user, _ = result
        self.assertEqual(returned_user, user)

    @patch('apps.users.auth.WebUsuarios.objects')
    def test_user_not_found_raises_authentication_failed(self, mock_wu):
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework.exceptions import AuthenticationFailed
        from apps.users.auth import CustomAuth
        from apps.users.models import WebUsuarios

        user = make_web_usuario(codigo=1)
        mock_wu.get.side_effect = WebUsuarios.DoesNotExist

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        auth = CustomAuth()
        request = self._make_request(token_header=f'Bearer {access}')

        with self.assertRaises(AuthenticationFailed):
            auth.authenticate(request)


# ---------------------------------------------------------------------------
# IsVendedor permission
# ---------------------------------------------------------------------------

class IsVendedorPermissionTest(TestCase):

    def test_vendedor_user_has_permission(self):
        from apps.users.permissions import IsVendedor

        request = MagicMock()
        request.user = make_web_usuario(catusu='V')

        permission = IsVendedor()
        self.assertTrue(permission.has_permission(request, None))

    def test_cliente_user_has_no_permission(self):
        from apps.users.permissions import IsVendedor

        request = MagicMock()
        request.user = make_web_usuario(catusu='C')

        permission = IsVendedor()
        self.assertFalse(permission.has_permission(request, None))

    def test_unauthenticated_user_has_no_permission(self):
        from apps.users.permissions import IsVendedor

        request = MagicMock()
        request.user = MagicMock()
        request.user.is_authenticated = False
        request.user.catusu = 'V'

        permission = IsVendedor()
        self.assertFalse(permission.has_permission(request, None))

    def test_anonymous_user_has_no_permission(self):
        from apps.users.permissions import IsVendedor

        request = MagicMock()
        request.user = None

        permission = IsVendedor()
        self.assertFalse(permission.has_permission(request, None))

    def test_user_without_catusu_has_no_permission(self):
        from apps.users.permissions import IsVendedor

        request = MagicMock()
        request.user = MagicMock(spec=[])
        request.user.is_authenticated = True

        permission = IsVendedor()
        self.assertFalse(permission.has_permission(request, None))


# ---------------------------------------------------------------------------
# crear_vendedor management command
# ---------------------------------------------------------------------------

class CrearVendedorCommandTest(TestCase):

    @patch('apps.users.management.commands.crear_vendedor.WebUsuarios.objects')
    @patch('apps.users.management.commands.crear_vendedor.Contactos.objects')
    def test_creates_contacto_and_web_usuario(self, mock_con, mock_wu):
        from django.core.management import call_command
        from io import StringIO

        mock_wu.filter.return_value.exists.return_value = False
        mock_con.filter.return_value.first.return_value = None
        ultimo = MagicMock()
        ultimo.nrocon = 100
        mock_con.order_by.return_value.first.return_value = ultimo

        out = StringIO()
        call_command('crear_vendedor', email='nuevo@test.com', stdout=out)

        mock_con.create.assert_called_once()
        mock_wu.create.assert_called_once()

        wu_kwargs = mock_wu.create.call_args.kwargs
        self.assertEqual(wu_kwargs['catusu'], 'V')
        self.assertEqual(wu_kwargs['e_mail'], 'nuevo@test.com')

    @patch('apps.users.management.commands.crear_vendedor.WebUsuarios.objects')
    @patch('apps.users.management.commands.crear_vendedor.Contactos.objects')
    def test_fails_if_email_already_exists(self, mock_con, mock_wu):
        from django.core.management import call_command
        from django.core.management.base import CommandError
        from io import StringIO

        mock_wu.filter.return_value.exists.return_value = True

        out = StringIO()
        with self.assertRaises(CommandError):
            call_command('crear_vendedor', email='duplicado@test.com', stdout=out)

    @patch('apps.users.management.commands.crear_vendedor.WebUsuarios.objects')
    @patch('apps.users.management.commands.crear_vendedor.Contactos.objects')
    def test_fails_if_nrodoc_already_exists(self, mock_con, mock_wu):
        from django.core.management import call_command
        from django.core.management.base import CommandError
        from io import StringIO

        # Primer filter (email) no existe, segundo filter (nrodoc) sí existe
        mock_wu.filter.return_value.exists.side_effect = [False, True]

        out = StringIO()
        with self.assertRaises(CommandError):
            call_command('crear_vendedor', email='otro@test.com', nrodoc='12345678', stdout=out)

    @patch('apps.users.management.commands.crear_vendedor.WebUsuarios.objects')
    @patch('apps.users.management.commands.crear_vendedor.Contactos.objects')
    def test_reuses_existing_contacto_by_nrodoc(self, mock_con, mock_wu):
        from django.core.management import call_command
        from io import StringIO

        mock_wu.filter.return_value.exists.return_value = False

        contacto_existente = make_contacto(nrocon=55, nrodoc='00000001')
        mock_con.filter.return_value.first.return_value = contacto_existente

        out = StringIO()
        call_command('crear_vendedor', email='vendedor@test.com', stdout=out)

        mock_con.create.assert_not_called()
        mock_wu.create.assert_called_once()

    @patch('apps.users.management.commands.crear_vendedor.WebUsuarios.objects')
    @patch('apps.users.management.commands.crear_vendedor.Contactos.objects')
    def test_custom_options_are_respected(self, mock_con, mock_wu):
        from django.core.management import call_command
        from io import StringIO

        mock_wu.filter.return_value.exists.return_value = False
        mock_con.filter.return_value.first.return_value = None
        ultimo = MagicMock()
        ultimo.nrocon = 200
        mock_con.order_by.return_value.first.return_value = ultimo

        out = StringIO()
        call_command(
            'crear_vendedor',
            email='custom@test.com',
            nombre='Juan Perez',
            clave='miclave1',
            nrodoc='87654321',
            stdout=out,
        )

        wu_kwargs = mock_wu.create.call_args.kwargs
        self.assertEqual(wu_kwargs['e_mail'], 'custom@test.com')
        self.assertEqual(wu_kwargs['nombre'], 'Juan Perez')
        self.assertEqual(wu_kwargs['clave'], 'miclave1')


# ---------------------------------------------------------------------------
# _send_reset_email helper
# ---------------------------------------------------------------------------

class SendResetEmailTest(TestCase):

    @patch('apps.users.views.http_requests.post')
    def test_calls_resend_api_endpoint(self, mock_post):
        mock_post.return_value = MagicMock()

        from apps.users.views import _send_reset_email
        _send_reset_email('user@test.com', 'Juan', 'http://localhost/nueva-password?token=abc')

        mock_post.assert_called_once()
        url_arg = mock_post.call_args[0][0]
        self.assertIn('resend.com', url_arg)

    @patch('apps.users.views.http_requests.post')
    def test_payload_contains_recipient_and_subject(self, mock_post):
        mock_post.return_value = MagicMock()

        from apps.users.views import _send_reset_email
        _send_reset_email('cliente@test.com', 'MariaJose', 'http://localhost/reset?token=xyz')

        payload = mock_post.call_args.kwargs['json']
        self.assertEqual(payload['to'], ['cliente@test.com'])
        self.assertEqual(payload['subject'], 'Recuperación de contraseña - Ser Natural')

    @patch('apps.users.views.http_requests.post')
    def test_html_body_contains_user_name_and_reset_url(self, mock_post):
        mock_post.return_value = MagicMock()

        from apps.users.views import _send_reset_email
        reset_url = 'http://localhost/nueva-password?token=tok123'
        _send_reset_email('user@test.com', 'Carlota', reset_url)

        payload = mock_post.call_args.kwargs['json']
        self.assertIn('Carlota', payload['html'])
        self.assertIn(reset_url, payload['html'])

    @patch('apps.users.views.http_requests.post')
    def test_raises_on_http_error(self, mock_post):
        import requests
        mock_resp = MagicMock()
        mock_resp.raise_for_status.side_effect = requests.HTTPError('401 Unauthorized')
        mock_post.return_value = mock_resp

        from apps.users.views import _send_reset_email
        with self.assertRaises(Exception):
            _send_reset_email('user@test.com', 'Juan', 'http://localhost/reset')


# ---------------------------------------------------------------------------
# PasswordResetRequestView
# ---------------------------------------------------------------------------

class PasswordResetRequestViewTest(APITestCase):

    def test_missing_email_returns_400(self):
        response = self.client.post('/api/auth/password-reset/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_empty_email_returns_400(self):
        response = self.client.post('/api/auth/password-reset/', {'email': ''})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.users.views.WebUsuarios.objects')
    def test_unknown_email_returns_200_without_revealing(self, mock_wu):
        from apps.users.models import WebUsuarios
        mock_wu.get.side_effect = WebUsuarios.DoesNotExist

        response = self.client.post('/api/auth/password-reset/', {'email': 'noexiste@test.com'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    @patch('apps.users.views._send_reset_email')
    @patch('apps.users.views.signing.dumps')
    @patch('apps.users.views.WebUsuarios.objects')
    def test_known_email_sends_mail_and_returns_200(self, mock_wu, mock_dumps, mock_send):
        user = make_web_usuario(e_mail='cliente@test.com', catusu='C')
        mock_wu.get.return_value = user
        mock_dumps.return_value = 'fake-token'

        response = self.client.post('/api/auth/password-reset/', {'email': 'cliente@test.com'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args[0][0], 'cliente@test.com')

    @patch('apps.users.views._send_reset_email')
    @patch('apps.users.views.WebUsuarios.objects')
    def test_email_is_lowercased_before_lookup(self, mock_wu, mock_send):
        from apps.users.models import WebUsuarios
        mock_wu.get.side_effect = WebUsuarios.DoesNotExist

        self.client.post('/api/auth/password-reset/', {'email': 'USER@EXAMPLE.COM'})

        mock_wu.get.assert_called_once_with(e_mail__iexact='user@example.com', catusu='C')
        mock_send.assert_not_called()

    @patch('apps.users.views._send_reset_email')
    @patch('apps.users.views.signing.dumps')
    @patch('apps.users.views.WebUsuarios.objects')
    def test_reset_url_contains_frontend_url_and_token(self, mock_wu, mock_dumps, mock_send):
        from django.conf import settings as django_settings
        user = make_web_usuario(catusu='C')
        mock_wu.get.return_value = user
        mock_dumps.return_value = 'tok-abc'

        self.client.post('/api/auth/password-reset/', {'email': 'cliente@test.com'})

        _, nombre_arg, url_arg = mock_send.call_args[0]
        self.assertIn(django_settings.FRONTEND_URL, url_arg)
        self.assertIn('tok-abc', url_arg)
        self.assertIn('nueva-password', url_arg)


# ---------------------------------------------------------------------------
# PasswordResetConfirmView
# ---------------------------------------------------------------------------

class PasswordResetConfirmViewTest(APITestCase):

    def test_missing_token_and_clave_returns_400(self):
        response = self.client.post('/api/auth/password-reset/confirm/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_token_returns_400(self):
        response = self.client.post('/api/auth/password-reset/confirm/', {'nueva_clave': 'abc123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_clave_returns_400(self):
        response = self.client.post('/api/auth/password-reset/confirm/', {'token': 'some-token'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_clave_too_long_returns_400(self):
        response = self.client.post('/api/auth/password-reset/confirm/', {
            'token': 'some-token',
            'nueva_clave': 'estoclaveeslargamucho',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('apps.users.views.signing.loads')
    def test_expired_token_returns_400_with_message(self, mock_loads):
        from django.core import signing
        mock_loads.side_effect = signing.SignatureExpired

        response = self.client.post('/api/auth/password-reset/confirm/', {
            'token': 'expired-token',
            'nueva_clave': 'nueva123',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('expiró', response.data['error'])

    @patch('apps.users.views.signing.loads')
    def test_bad_signature_returns_400_with_message(self, mock_loads):
        from django.core import signing
        mock_loads.side_effect = signing.BadSignature

        response = self.client.post('/api/auth/password-reset/confirm/', {
            'token': 'tampered-token',
            'nueva_clave': 'nueva123',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('inválido', response.data['error'])

    @patch('apps.users.views.WebUsuarios.objects')
    @patch('apps.users.views.signing.loads')
    def test_user_not_found_returns_400(self, mock_loads, mock_wu):
        from apps.users.models import WebUsuarios
        mock_loads.return_value = 999
        mock_wu.get.side_effect = WebUsuarios.DoesNotExist

        response = self.client.post('/api/auth/password-reset/confirm/', {
            'token': 'valid-token',
            'nueva_clave': 'nueva123',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('apps.users.views.WebUsuarios.objects')
    @patch('apps.users.views.signing.loads')
    def test_success_updates_clave_and_returns_ok(self, mock_loads, mock_wu):
        mock_loads.return_value = 1
        user = make_web_usuario(codigo=1, catusu='C')
        mock_wu.get.return_value = user

        response = self.client.post('/api/auth/password-reset/confirm/', {
            'token': 'valid-token',
            'nueva_clave': 'nueva123',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('ok'))
        self.assertEqual(user.clave, 'nueva123')
        user.save.assert_called_once_with(update_fields=['clave'])

    @patch('apps.users.views.WebUsuarios.objects')
    @patch('apps.users.views.signing.loads')
    def test_clave_exactly_8_chars_succeeds(self, mock_loads, mock_wu):
        mock_loads.return_value = 1
        user = make_web_usuario(codigo=1, catusu='C')
        mock_wu.get.return_value = user

        response = self.client.post('/api/auth/password-reset/confirm/', {
            'token': 'valid-token',
            'nueva_clave': '12345678',
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('apps.users.views.signing.loads')
    def test_loads_called_with_correct_salt_and_max_age(self, mock_loads):
        from django.core import signing
        mock_loads.side_effect = signing.BadSignature

        self.client.post('/api/auth/password-reset/confirm/', {
            'token': 'some-token',
            'nueva_clave': 'nueva123',
        })

        mock_loads.assert_called_once_with('some-token', salt='password-reset', max_age=3600)
        self.assertEqual(wu_kwargs['nrodoc'], '87654321')
