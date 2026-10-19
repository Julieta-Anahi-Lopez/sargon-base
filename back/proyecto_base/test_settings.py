"""
Test settings — uses SQLite in-memory DB and local-memory cache.
All models have managed=False (legacy ERP DB), so ORM calls are mocked in tests.

Run tests with:
    python manage.py test --settings=proyecto_base.test_settings
"""

from proyecto_base.settings import *  # noqa: F401, F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# apps.pedidos is missing from the main settings but required for URL routing
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'apps',
    'apps.articulos',
    'apps.categorias',
    'apps.users',
    'apps.parametros',
    'apps.pedidos',
]

# Silence MEDIA_URL warnings in tests
MEDIA_URL = '/media/'

# Throttle rates required by LoginRateThrottle (scope='login')
REST_FRAMEWORK = {
    **REST_FRAMEWORK,  # noqa: F405 — inherited from settings import *
    'DEFAULT_THROTTLE_RATES': {
        'login': '1000/hour',
    },
}
