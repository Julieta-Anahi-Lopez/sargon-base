from unittest.mock import patch, MagicMock

from django.test import TestCase

from apps.parametros.models import Parametros, get_parametro


class GetParametroTest(TestCase):
    """Unit tests for the get_parametro utility function."""

    @patch('apps.parametros.models.Parametros.objects')
    def test_returns_value_when_found(self, mock_objects):
        param = MagicMock()
        param.valor = '9'
        mock_objects.get.return_value = param

        result = get_parametro('Web', 1)

        mock_objects.get.assert_called_once_with(aplica='Web', codigo=1)
        self.assertEqual(result, '9')

    @patch('apps.parametros.models.Parametros.objects')
    def test_returns_default_when_not_found(self, mock_objects):
        mock_objects.get.side_effect = Parametros.DoesNotExist

        result = get_parametro('Web', 99, default='fallback')

        self.assertEqual(result, 'fallback')

    @patch('apps.parametros.models.Parametros.objects')
    def test_returns_none_when_not_found_and_no_default(self, mock_objects):
        mock_objects.get.side_effect = Parametros.DoesNotExist

        result = get_parametro('Web', 99)

        self.assertIsNone(result)
