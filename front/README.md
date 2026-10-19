# sargon-base — Frontend

Interfaz web B2B para distribuidoras mayoristas. Permite a clientes (comercios) navegar el catálogo con precios mayoristas, gestionar el carrito y realizar pedidos. Los vendedores pueden crear y editar cuentas de clientes.

## Configuración del cliente

Editá `lib/config.ts` para adaptar el template a un nuevo cliente:

```ts
export const CLIENTE = {
  nombre:   "Nombre del Cliente",
  eslogan:  "Tu eslogan aquí",
  contacto: {
    whatsapp:  "549XXXXXXXXXX",   // formato internacional sin +
    email:     "info@cliente.com",
    instagram: "usuario",         // sin @
    direccion: "Dirección completa",
    mapsUrl:   "https://maps.google.com/...",
  },
  whatsapp: {
    mensajeFlotante: "Hola, quiero hacer una consulta.",
    mensajeFooter:   "Hola, quiero consultar.",
  },
  seo: {
    titulo:      "Nombre del Cliente",
    descripcion: "Descripción para SEO.",
  },
  localidades: [ /* lista de { value, label } */ ],
  features: {
    registroLibre:  false,
    moduloVendedor: true,
  },
};
```

La paleta de colores se define en `tailwind.config.ts`.

## Stack

| Tecnología | Versión |
|---|---|
| Next.js | 15 (App Router) |
| React | 19 |
| TypeScript | — |
| Tailwind CSS | v4 |
| Redux Toolkit | — |
| Lucide React | — |
| Jest + React Testing Library | — |

## Estructura de rutas (App Router)

```
app/
├── (auth)/                 # Solo Header — sin Footer
│   ├── layout.tsx
│   ├── login/
│   ├── recuperar-password/ # Solicitar recuperación de contraseña
│   └── nueva-password/     # Ingresar nueva contraseña con token del email
├── (public)/               # Header + Footer — acceso libre
│   ├── layout.tsx
│   ├── page.tsx            # Home / Landing
│   ├── catalogo/
│   ├── nosotros/
│   ├── politica-privacidad/
│   └── terminos/
└── (private)/              # Header + Footer — requiere autenticación
    ├── layout.tsx
    ├── carrito/
    ├── cuenta/
    ├── pedidos/
    ├── pedido-confirmado/
    └── vendedor/
        └── nuevo-usuario/  # Solo rol vendedor (catusu=V)
```

El middleware (`middleware.ts`) protege las rutas privadas con JWT y bloquea `/registro` permanentemente (redirige a `/login`).

## Roles de usuario

| `catusu` | Rol | Acceso |
|---|---|---|
| `C` | Cliente | Catálogo, carrito, pedidos propios |
| `V` | Vendedor | Todo lo anterior + creación/edición de usuarios |

No existe auto-registro. El vendedor crea las cuentas de los clientes desde `/vendedor/nuevo-usuario`.

## Recuperación de contraseña

El flujo es completamente stateless (no usa Redux):

1. El usuario hace clic en "¿Olvidaste tu contraseña?" en `/login` y es llevado a `/recuperar-password`.
2. Ingresa su email → el frontend hace `POST /api/auth/password-reset/` y muestra un mensaje de confirmación independientemente del resultado (no revela si el email existe).
3. El usuario recibe un email con un link a `/nueva-password?token=<token>`.
4. En `/nueva-password` ingresa y confirma su nueva contraseña (máx. 8 caracteres) → el frontend hace `POST /api/auth/password-reset/confirm/` con el token y la nueva clave.
5. Al confirmar, se redirige automáticamente a `/login`.

## Estado global (Redux)

| Slice | Responsabilidad |
|---|---|
| `authSlice` | Token JWT, datos del usuario autenticado, login/logout |
| `cartSlice` | Ítems del carrito, cantidades |
| `filtersSlice` | Filtros activos del catálogo (rubro, marca, búsqueda) |
| `orderSlice` | Envío y confirmación de pedidos |

## Variables de entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8004/api
```

Ver `.env.example` para el template completo.

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:3000
```

## Con Docker

El nombre del contenedor se toma de `COMPOSE_PROJECT_NAME` (default: `sargon`):

```bash
cd docker/
COMPOSE_PROJECT_NAME=nombre_cliente docker compose up --build
# Disponible en http://localhost:3006
```

## Build y verificación

```bash
npm run build
```

Errores de TypeScript o ESLint en esta etapa bloquean el deploy — son intencionales para garantizar calidad.

## Tests

```bash
npm test
npm test -- --watch
npm test -- --coverage
```

## Pendientes de contenido (por cliente)

- [ ] Logo del cliente (reemplazar `/images/logo.png`)
- [ ] Imágenes de hero y secciones (`/images/hero.jpg`, etc.)
- [ ] Texto real en `/nosotros`, `/politica-privacidad` y `/terminos`
- [ ] Configurar `COMPOSE_PROJECT_NAME` en el entorno de producción
