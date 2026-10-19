# Ser Natural — Backend

API REST para la plataforma B2B de Ser Natural, distribuidora de productos naturales. Permite a clientes (comercios) consultar el catálogo, gestionar el carrito y realizar pedidos; y a vendedores administrar usuarios y pedidos.

## Stack

| Tecnología | Versión |
|---|---|
| Python | 3.x |
| Django | 3.2 |
| Django REST Framework | 3.x |
| SimpleJWT | — |
| MySQL | — |
| Redis | — |
| Docker / Docker Compose | — |

## Estructura del proyecto

```
ser_natural/
├── proyecto_base/          # Configuración Django (settings, urls, wsgi)
│   ├── settings.py
│   ├── test_settings.py    # Settings para tests (SQLite en memoria)
│   └── urls.py
├── apps/
│   ├── articulos/          # Catálogo de productos (VistaArticulos — managed=False)
│   ├── categorias/         # Rubros, subrubros y marcas
│   ├── users/              # Autenticación, contactos y usuarios web
│   │   └── management/
│   │       └── commands/
│   │           └── crear_vendedor.py
│   ├── pedidos/            # Pedidos y detalle
│   └── parametros/         # Tablas de configuración
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── manage.py
└── requirements.txt
```

## Configuración

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto (junto a `manage.py`):

```env
SECRET_KEY=tu_clave_secreta
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_ENGINE=django.db.backends.mysql
DATABASE_NAME=ser_natural_db
DATABASE_USER=usuario
DATABASE_PASSWORD=contraseña
DATABASE_HOST=db
DATABASE_PORT=3306

# Resend — recuperación de contraseña
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:3000
```

### Con Docker (recomendado)

```bash
cd docker/
docker compose up --build
```

Los servicios levantados son:
- **ser_natural_backend** — Django en puerto `8004`
- **db** — MySQL
- **redis** — Redis

### Sin Docker (desarrollo local)

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8004
```

> Requiere MySQL corriendo localmente con las variables de entorno configuradas en `.env`.

## API Endpoints

Base URL: `http://localhost:8004/api/`

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login — devuelve `access` + `refresh` JWT |
| POST | `/api/auth/token/refresh/` | Refresca el token de acceso |
| GET | `/api/auth/me/` | Devuelve datos del usuario autenticado |
| POST | `/api/auth/password-reset/` | Solicita recuperación de contraseña — envía email con link via Resend |
| POST | `/api/auth/password-reset/confirm/` | Confirma el cambio de contraseña usando el token del email |

### Catálogo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/articulos/` | Lista artículos (autenticado; precio según lista del contacto) |
| GET | `/api/tipo-rubros/` | Rubros (categorías) |
| GET | `/api/tipo-subrubros/` | Subrubros |
| GET | `/api/tipo-rubros-con-subrubros/` | Árbol rubros + subrubros |
| GET | `/api/tipo-marcas/` | Marcas |
| GET | `/api/imagenes/` | Imágenes de artículos |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/contactos/` | Lista contactos (vendedores) |
| POST | `/api/web-usuarios/` | Crea usuario web — solo vendedores (`catusu=V`) |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pedidos/` | Crea un pedido |
| GET | `/api/pedidos/` | Lista pedidos del usuario autenticado |

## Autenticación

Se usa JWT mediante `rest_framework_simplejwt`. El sistema define una clase de autenticación personalizada (`CustomAuth`) que resuelve el `Contacto` asociado al token y lo inyecta en el request.

- `catusu = 'V'` → vendedor (puede crear usuarios)
- `catusu = 'C'` → cliente (acceso de lectura al catálogo y pedidos propios)

El permiso `IsVendedor` protege los endpoints exclusivos de vendedores.

## Recuperación de contraseña

El flujo usa **Resend** para el envío de emails y tokens firmados con `django.core.signing` (expiración 1 hora):

1. El cliente envía `POST /api/auth/password-reset/` con su email.
2. Si el email corresponde a un usuario `catusu='C'`, el backend genera un token firmado y envía un email con el link `{FRONTEND_URL}/nueva-password?token=<token>`.
3. El cliente abre el link, ingresa su nueva contraseña y envía `POST /api/auth/password-reset/confirm/` con el token y la nueva clave.
4. El backend valida el token, actualiza el campo `clave` en `web_usuarios` y devuelve `{"ok": true}`.

El endpoint de solicitud siempre responde con 200 independientemente de si el email existe, para no revelar información de usuarios registrados.

## Crear el primer vendedor

Como la creación de usuarios requiere un vendedor autenticado, para bootstrappear el primer vendedor se usa el management command:

```bash
# Dentro del contenedor Docker
docker exec ser_natural_backend python manage.py crear_vendedor \
  --email vendedor@ejemplo.com \
  --nombre "Nombre Apellido" \
  --clave mi_clave \
  --nrodoc 12345678 \
  --locali 8000

# Flags opcionales
#   --locali  código postal de localidad (default: 8000 = Bahía Blanca)
#   --cp      código postal
#   --nrodoc  DNI (7 u 8 dígitos; se genera uno si se omite)
#   --clave   contraseña inicial (default: "1234")
```

Si ya existe un `Contacto` con el mismo DNI, el command lo reutiliza en lugar de crear uno nuevo.

## Tests

Los tests usan una base de datos SQLite en memoria (`test_settings.py`) para evitar depender de MySQL. Los modelos con `managed=False` (vistas de BD) se mockean completamente.

```bash
# Dentro del contenedor Docker
docker exec ser_natural_backend python manage.py test apps.users --settings=proyecto_base.test_settings

# Todos los tests
docker exec ser_natural_backend python manage.py test --settings=proyecto_base.test_settings
```

Suite actual distribuida en los módulos de cada app:

| Archivo | Tests | Qué cubre |
|---|---|---|
| `apps/users/tests.py` | 69 | Login, MeView, WebUsuariosViewSet, permisos, serializers, `crear_vendedor`, password reset, `_send_reset_email` |
| `apps/pedidos/tests.py` | 16 | Serializer, creación con validación de stock, listado por usuario, detalle, resumen |
| `apps/articulos/tests.py` | — | Paginación, serializers con/sin autenticación |
| `apps/categorias/tests.py` | 10 | Rubros, subrubros, marcas, caché del árbol |
| `apps/parametros/tests.py` | — | `get_parametro` helper |

## Notas de arquitectura

- Los modelos de artículos (`VistaArticulos`) son vistas SQL (`managed=False`). No se migran y deben existir en la BD de producción. En tests se mockean.
- El precio que ve cada cliente depende del campo `nrolis` del contacto: `nrolis=0` → precio base; `nrolis=1` → `lista1`.
- Redis se usa para caché (no para sesiones).
