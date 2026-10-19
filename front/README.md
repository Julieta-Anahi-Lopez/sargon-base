# Ser Natural — Frontend

Interfaz web B2B para Ser Natural, distribuidora de productos naturales. Permite a clientes (comercios) navegar el catálogo con precios mayoristas, gestionar el carrito y realizar pedidos. Los vendedores pueden crear cuentas para nuevos clientes.

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

## Paleta de colores

| Token Tailwind | Color | Uso |
|---|---|---|
| `brand` | Verde oscuro (`#2D5016`) | Texto principal, fondos de énfasis |
| `brand-light` | Lima claro (`#E8F2A8`) | Fondos de sección, degradados |
| `accent` | Lima vibrante (`#A8C F25`) | Acentos, hovers |

Los colores se definen en `tailwind.config.ts`.

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
| `V` | Vendedor | Todo lo anterior + creación de usuarios |

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

## Configuración

### Variables de entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8004/api
```

> `NEXT_PUBLIC_API_URL` es usado por todas las páginas que llaman al backend, incluyendo las de recuperación de contraseña.

### Desarrollo local

```bash
npm install
npm run dev       # http://localhost:3000
```

### Con Docker

El servicio corre como `SER_NATURAL_FRONTEND` en el puerto **3005**.

```bash
docker compose up --build
# Disponible en http://localhost:3005
```

## Build y verificación

Antes de deployar, verificar que el build de producción pase sin errores:

```bash
npm run build
```

Errores de TypeScript o ESLint en esta etapa bloquean el deploy — son intencionales para garantizar calidad.

## Tests

```bash
# Ejecutar todos los tests del frontend
npm test

# Modo interactivo (watch)
npm test -- --watch

# Con coverage
npm test -- --coverage
```

Suite actual distribuida en:

| Archivo | Tests | Qué cubre |
|---|---|---|
| `__tests__/redux/authSlice.test.ts` | 8 | Estado inicial, login thunk, logout, initializeAuth |
| `__tests__/redux/cartSlice.test.ts` | — | addToCart, removeFromCart, clearCart, localStorage |
| `__tests__/redux/orderSlice.test.ts` | 4 | Estado inicial, resetOrder, submitOrder thunk |
| `__tests__/redux/filtersSlice.test.ts` | — | Filtros de catálogo |
| `__tests__/components/Button.test.tsx` | 10 | Variantes, loading, disabled, onClick |
| `__tests__/components/Modal.test.tsx` | — | Apertura/cierre, contenido |
| `__tests__/components/ProductCard.test.tsx` | — | Renderizado, add al carrito |
| `__tests__/components/ScrollToTop.test.tsx` | — | Visibilidad según scroll |
| `__tests__/hooks/useAuth.test.ts` | — | Estado de autenticación, logout |
| `__tests__/middleware.test.ts` | 11 | Rutas públicas/privadas/auth/bloqueadas + recuperar-password/nueva-password |
| `__tests__/pages/login.test.tsx` | 9 | Campos, eye toggle, link recuperar contraseña, ausencia de /registro |
| `__tests__/pages/nuevo-usuario.test.tsx` | 8 | Validaciones del formulario, submit exitoso |
| `__tests__/pages/recuperar-password.test.tsx` | 7 | Renderizado, éxito, errores de red/servidor, lowercase email |
| `__tests__/pages/nueva-password.test.tsx` | 12 | Sin token, validaciones, submit, éxito, errores |
| `__tests__/utils/formatters.test.ts` | — | Formatters de precio y fecha |

> Los tests del backend (51 tests) corren por separado en el repositorio `ser_natural/`. Ver `GUIA_TESTS.md` para más detalles.

## Documentación adicional

- `DOCUMENTACION_TECNICA.md` — arquitectura detallada, componentes y convenciones
- `GUIA_TESTS.md` — guía completa de la suite de tests (front + back)

## Pendientes de contenido

- [ ] Logo definitivo de Ser Natural (reemplazar icono `<Leaf>` de Lucide)
- [ ] Imágenes reales de productos / secciones de home
- [ ] Número de WhatsApp de contacto para el footer
- [ ] Configuración de dominio de producción en `ALLOWED_HOSTS` y CORS del backend
- [ ] Política de privacidad y términos con contenido real
