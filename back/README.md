# sargon-base — Backend

API REST para plataformas B2B de distribuidoras mayoristas. Permite a clientes (comercios) consultar el catálogo, gestionar el carrito y realizar pedidos; y a vendedores administrar usuarios y pedidos.

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
back/
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
│   ├── docker-compose.yml
│   └── .env.example
├── manage.py
└── requirements.txt
```

## Configuración

### Variables de entorno

Crear un archivo `.env` dentro de `docker/` (copiar desde `.env.example`):

```env
SECRET_KEY=tu_clave_secreta
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_ENGINE=django.db.backends.mysql
DATABASE_NAME=nombre_db
DATABASE_USER=usuario
DATABASE_PASSWORD=contraseña
DATABASE_HOST=db
DATABASE_PORT=3306

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:3000

# Identidad del cliente (aparece en emails de recuperación de contraseña)
NOMBRE_CLIENTE=Nombre del Cliente
EMAIL_FROM=Nombre del Cliente <noreply@tudominio.com>
```

Ver `docker/.env.example` para el template completo.

### Con Docker (recomendado)

El nombre de los contenedores se toma de `COMPOSE_PROJECT_NAME` (default: `sargon`):

```bash
cd docker/
COMPOSE_PROJECT_NAME=nombre_cliente docker compose up --build
```

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
| POST | `/api/auth/password-reset/` | Solicita recuperación de contraseña — envía email via Resend |
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
| GET | `/api/web-usuarios/buscar/` | Busca usuario por email o N° de cliente — solo vendedores |
| PATCH | `/api/web-usuarios/editar/` | Edita email/contraseña/NroCon — solo vendedores |
| DELETE | `/api/web-usuarios/eliminar/` | Elimina acceso web y vacía carrito — solo vendedores |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pedidos/` | Crea un pedido |
| GET | `/api/pedidos/` | Lista pedidos del usuario autenticado |

## Autenticación

JWT via `rest_framework_simplejwt`. La clase `CustomAuth` resuelve el `Contacto` asociado al token y lo inyecta en el request.

- `catusu = 'V'` → vendedor (puede crear/editar/eliminar usuarios)
- `catusu = 'C'` → cliente (catálogo y pedidos propios)

## Crear el primer vendedor

```bash
# Dentro del contenedor Docker
docker exec ${COMPOSE_PROJECT_NAME:-sargon}_backend python manage.py crear_vendedor \
  --email vendedor@ejemplo.com \
  --nombre "Nombre Apellido" \
  --clave mi_clave \
  --nrodoc 12345678 \
  --locali 8000
```

Si ya existe un `Contacto` con el mismo DNI, el command lo reutiliza en lugar de crear uno nuevo.

## Tests

```bash
# Dentro del contenedor Docker
docker exec ${COMPOSE_PROJECT_NAME:-sargon}_backend python manage.py test apps.users --settings=proyecto_base.test_settings

# Todos los tests
docker exec ${COMPOSE_PROJECT_NAME:-sargon}_backend python manage.py test --settings=proyecto_base.test_settings
```

## Notas de arquitectura

- Los modelos de artículos (`VistaArticulos`) son vistas SQL (`managed=False`). No se migran y deben existir en la BD de producción. En tests se mockean.
- El precio que ve cada cliente depende del campo `nrolis` del contacto: `nrolis=0` → precio base; `nrolis=1` → `lista1`.
- Redis se usa para caché (no para sesiones).
- `NombPC = 'Sitio Web'` identifica los pedidos creados desde el frontend en la tabla `pedidos`.
