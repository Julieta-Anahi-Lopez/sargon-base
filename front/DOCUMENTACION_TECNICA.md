# Documentación Técnica - Frontend Base E-commerce

## Índice

1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración Inicial](#configuración-inicial)
5. [Arquitectura](#arquitectura)
6. [Componentes](#componentes)
7. [Estado Global (Redux)](#estado-global-redux)
8. [Hooks Personalizados](#hooks-personalizados)
9. [Servicios y API](#servicios-y-api)
10. [Autenticación](#autenticación)
11. [Sistema de Filtros](#sistema-de-filtros)
12. [Carrito de Compras](#carrito-de-compras)
13. [Pedidos](#pedidos)
14. [Estilos y Diseño](#estilos-y-diseño)
15. [Testing](#testing)
16. [Personalización para Nuevos Clientes](#personalización-para-nuevos-clientes)
17. [Despliegue](#despliegue)
18. [Variables de Entorno](#variables-de-entorno)

---

## Descripción General

Este es un **frontend base para e-commerce B2B** desarrollado con Next.js 15. Está diseñado para conectarse a un backend Django REST Framework que gestiona:

- Catálogo de productos (artículos)
- Sistema de usuarios y autenticación JWT
- Gestión de pedidos
- Categorías, subcategorías y marcas

### Características Principales

- Catálogo de productos con filtros dinámicos
- Carrito de compras persistente (localStorage)
- Sistema de autenticación JWT
- Creación y visualización de pedidos
- Diseño responsive (mobile-first)
- Filtros sincronizados con URL (compartibles)

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 15.1.6 | Framework React con App Router |
| React | 19.0.0 | Librería UI |
| TypeScript | 5.x | Tipado estático |
| Redux Toolkit | 2.5.1 | Estado global |
| Tailwind CSS | 3.4.1 | Estilos utility-first |
| Lucide React | 0.474.0 | Iconografía |
| Jest | 30.x | Testing |

---

## Estructura del Proyecto

```
proyecto_base_frontend/
├── app/                          # App Router de Next.js
│   ├── components/               # Componentes React
│   │   ├── cart/                 # Componentes del carrito
│   │   │   ├── BankInfoModal.tsx
│   │   │   ├── CartItemRow.tsx
│   │   │   ├── OrdersList.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── AuthProvider.tsx
│   │   ├── CartModal.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FiltersPanel.tsx      # Panel de filtros dinámicos
│   │   ├── Footer.tsx
│   │   ├── Header.tsx            # Header con carrito y usuario
│   │   ├── LoginPrompt.tsx
│   │   ├── Modal.tsx             # Modal reutilizable
│   │   ├── ProductCard.tsx       # Tarjeta de producto
│   │   ├── ProductGrid.tsx       # Grilla de productos
│   │   ├── ScrollToTop.tsx       # Botón volver arriba
│   │   └── WhatsAppButton.tsx
│   ├── lib/
│   │   ├── hooks/                # Hooks personalizados
│   │   │   ├── useAuth.ts        # Autenticación
│   │   │   ├── useUrlFilters.ts  # Filtros sincronizados con URL
│   │   │   ├── useDebounce.ts
│   │   │   └── ...
│   │   └── providers/
│   │       └── QueryProvider.tsx
│   ├── catalogo/
│   │   └── page.tsx              # Página principal del catálogo
│   ├── login/
│   │   └── page.tsx              # Página de login
│   ├── pedido-confirmado/
│   │   └── page.tsx
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página de inicio (landing)
│   ├── error.tsx                 # Página de error
│   ├── not-found.tsx             # Página 404
│   └── globals.css               # Estilos globales
├── redux/
│   ├── slices/
│   │   ├── authSlice.tsx         # Estado de autenticación
│   │   ├── cartSlice.ts          # Estado del carrito
│   │   ├── filtersSlice.ts       # Estado de filtros
│   │   └── orderSlice.ts         # Estado de pedidos
│   ├── Provider.tsx              # Provider de Redux
│   └── hooks.tsx                 # Hooks tipados de Redux
├── services/
│   └── api.tsx                   # Cliente API centralizado
├── types/
│   └── index.ts                  # Tipos TypeScript centralizados
├── store.ts                      # Configuración del store Redux
├── middleware.ts                 # Middleware de Next.js (auth)
├── next.config.ts                # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind
└── package.json
```

---

## Configuración Inicial

### Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd proyecto_base_frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL de la API

# Iniciar en desarrollo
npm run dev
```

### Variables de Entorno Requeridas

```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

### Scripts Disponibles

```bash
npm run dev          # Desarrollo con Turbopack
npm run build        # Build de producción
npm run start        # Iniciar en producción
npm run lint         # Ejecutar ESLint
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura
```

---

## Arquitectura

### Flujo de Datos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │────▶│  Componente │────▶│   Redux     │
│  (Acción)   │     │   React     │     │   Store     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Hooks     │     │ localStorage│
                    │ (useAuth,   │     │  (carrito)  │
                    │ useFilters) │     └─────────────┘
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  API Service│────▶ Backend Django
                    └─────────────┘
```

### Patrón de Componentes

- **Componentes de página** (`app/*/page.tsx`): Coordinan datos y UI
- **Componentes de UI** (`app/components/`): Reutilizables, sin lógica de negocio
- **Hooks** (`app/lib/hooks/`): Lógica reutilizable y efectos secundarios
- **Slices Redux** (`redux/slices/`): Estado global y acciones

---

## Componentes

### Componentes Principales

#### `Header.tsx`
Header principal con navegación, usuario y carrito.

**Props:**
```typescript
interface HeaderProps {
  pedidos?: Pedido[];           // Lista de pedidos (opcional)
  pedidosLoading?: boolean;     // Estado de carga
  onSubmitOrder?: Function;     // Callback para crear pedido
  onLogoutRefresh?: () => void; // Callback post-logout
}
```

**Características:**
- Menú responsive (hamburguesa en mobile)
- Preview del carrito en hover (desktop)
- Dropdown de usuario con logout
- Carga autónoma de pedidos si no se pasan por props

#### `FiltersPanel.tsx`
Panel de filtros dinámicos para el catálogo.

**Props:**
```typescript
interface Props {
  rubros: Rubro[];              // Categorías disponibles
  marcas: Marca[];              // Marcas disponibles
  onChange: (filters) => void;  // Callback cuando cambian filtros
  initialFilters?: FiltersState;
}
```

**Comportamiento:**
- Selects (marca, categoría): aplican inmediatamente
- Inputs de texto (código, nombre): debounce 400ms + mín. 2 caracteres
- Input precio: debounce 500ms
- Sincronizado con URL via `useUrlFilters`

#### `ProductCard.tsx`
Tarjeta individual de producto.

**Props:**
```typescript
interface ProductProps {
  product: {
    codigo: string;
    nombre: string;
    observ: string;
    precio_final: number;
    stock: number;
    imagenes: { foto_1: string }[];
  };
  isAuthenticated: boolean;
}
```

**Características:**
- Badge de código y stock
- Selector de cantidad (+/-)
- Botón agregar al carrito
- Modal de información detallada
- Imagen con fallback

#### `Modal.tsx`
Modal reutilizable con diseño mejorado.

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  codigo: string;
  children: React.ReactNode;
  stock?: number;
  precio?: number;
  onAddToCart?: (cantidad: number) => void;
  isAuthenticated?: boolean;
}
```

**Características:**
- Animaciones de entrada (fade + scale)
- Cerrar con Escape o clic fuera
- Backdrop con blur
- Badge de stock con colores
- Botón agregar al carrito integrado

#### `CartModal.tsx`
Modal completo del carrito con pestañas.

**Pestañas:**
1. **Carrito actual**: Lista de items, modificar cantidades, eliminar
2. **Mis pedidos**: Historial de pedidos realizados

**Funcionalidades:**
- Crear pedido con observaciones
- Ver información bancaria para transferencias
- Total calculado automáticamente

---

## Estado Global (Redux)

### Store Configuration (`store.ts`)

```typescript
const store = configureStore({
  reducer: {
    filters: filtersReducer,  // Estado de filtros
    cart: cartReducer,        // Carrito de compras
    auth: authReducer,        // Autenticación
    order: orderReducer,      // Estado de pedidos
  },
});
```

### Slices

#### `cartSlice.ts`
Maneja el carrito de compras.

**Estado:**
```typescript
interface CartState {
  items: CartItem[];
}
```

**Acciones:**
- `addToCart(item)`: Agrega item o incrementa cantidad
- `removeFromCart(codigo | {codigo, removeCompletely})`: Reduce cantidad o elimina
- `clearCart()`: Vacía el carrito
- `loadCartFromStorage()`: Carga desde localStorage

**Persistencia:** Automática en localStorage

#### `authSlice.tsx`
Maneja la autenticación.

**Estado:**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}
```

**Acciones:**
- `checkAuthState`: Verifica tokens al iniciar
- `setCredentials`: Guarda credenciales post-login
- `logout`: Limpia sesión

#### `filtersSlice.ts`
Maneja los filtros del catálogo.

**Estado:**
```typescript
interface FiltersState {
  category: string | null;
  subcategory: string | null;
  precio_max: number | null;
  nromar: string | null;      // Marca
  codigo: string | null;
  nombre: string | null;
}
```

---

## Hooks Personalizados

### `useAuth.ts`
Hook principal de autenticación.

```typescript
const {
  token,           // Token JWT actual
  user,            // Datos del usuario
  isAuthenticated, // Boolean de estado
  authChecked,     // True cuando se verificó localStorage
  logout           // Función para cerrar sesión
} = useAuth();
```

### `useUrlFilters.ts`
Sincroniza filtros con query params de la URL.

```typescript
const {
  filters,          // Estado actual de filtros
  setFilters,       // Actualizar todos los filtros
  updateFilter,     // Actualizar un filtro específico
  setCategory,      // Cambiar categoría (resetea subcategoría)
  clearFilters,     // Limpiar todos los filtros
  hasActiveFilters, // Boolean si hay filtros activos
  isInitialized,    // True cuando se leyeron params de URL
} = useUrlFilters();
```

**Beneficios:**
- URLs compartibles con filtros aplicados
- Persistencia de filtros al recargar
- Historial de navegación limpio (usa `replace`)

### `useDebounce.ts`
Debounce genérico para valores.

```typescript
const debouncedValue = useDebounce(value, delay);
```

---

## Servicios y API

### `api.tsx` - Cliente API Centralizado

**Configuración:**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Métodos Genéricos:**
```typescript
apiService.get(endpoint)
apiService.post(endpoint, data)
apiService.put(endpoint, data)
apiService.delete(endpoint)
```

**Métodos Específicos:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `getProducts(filters)` | `/articulos/` | Lista productos con filtros | No |
| `getCategories()` | `/categorias/` | Lista categorías | No |
| `getSubcategories(id)` | `/subcategorias/` | Subcategorías | No |
| `getMarcas()` | `/tipo-marcas/` | Lista marcas | No |
| `getRubros()` | `/tipo-rubros-con-subrubros/` | Rubros con subrubros | No |
| `createPedido(data)` | `/pedidos/` | Crear pedido | Sí |
| `getPedidosCliente()` | `/pedidos/usuario/mis-pedidos/` | Mis pedidos | Sí |

**Manejo de Errores:**
- Token expirado (401): logout automático + retry sin auth para endpoints públicos
- Respuestas no-JSON: error descriptivo
- Logging en consola con emojis para debugging

---

## Autenticación

### Flujo de Autenticación

```
1. Usuario ingresa credenciales en /login
2. POST /api/auth/login → Backend valida
3. Backend responde con {access, refresh, user}
4. Frontend guarda en localStorage:
   - auth_token (access token)
   - refresh_token
   - user (JSON)
5. useAuth() lee localStorage y actualiza estado
6. Componentes reaccionan a isAuthenticated
```

### Middleware de Protección (`middleware.ts`)

**Rutas Protegidas:**
- `/pedido-confirmado`
- `/cart`

**Rutas Públicas:**
- `/`, `/login`, `/catalogo`, `/terminos`, `/politica-privacidad`

**Comportamiento:**
- Rutas protegidas sin token → redirect a `/login?returnTo=...`
- `/login` con token → redirect a `/catalogo`

### Sincronización de Cookies

El hook `useCookieSync` sincroniza el token entre localStorage y cookies para que el middleware de Next.js pueda verificar autenticación.

---

## Sistema de Filtros

### Filtros Disponibles

| Filtro | Tipo | Comportamiento |
|--------|------|----------------|
| `nromar` | Select | Inmediato |
| `category` | Select | Inmediato (resetea subcategory) |
| `subcategory` | Select | Inmediato |
| `codigo` | Input | Debounce 400ms, mín 2 chars |
| `nombre` | Input | Debounce 400ms, mín 2 chars |
| `precio_max` | Input | Debounce 500ms |

### Flujo de Filtros

```
Usuario cambia filtro
       │
       ▼
┌──────────────┐
│ FiltersPanel │ actualiza localFilters
└──────────────┘
       │
       ├─── Select? ──▶ onChange() inmediato
       │
       └─── Input? ───▶ Debounce → onChange() si cumple mínimo

       │
       ▼
┌──────────────┐
│ useUrlFilters│ actualiza URL (replace)
└──────────────┘
       │
       ▼
┌──────────────┐
│ CatalogoPage │ detecta cambio en filters
└──────────────┘
       │
       ▼
┌──────────────┐
│ apiService   │ GET /articulos/?filtros...
└──────────────┘
```

---

## Carrito de Compras

### Estructura del Item

```typescript
interface CartItem {
  codigo: string;   // ID único del producto
  nombre: string;   // Nombre para mostrar
  precio: number;   // Precio unitario
  cantidad: number; // Cantidad en carrito
  image: string;    // URL de imagen
}
```

### Operaciones

**Agregar al carrito:**
```typescript
dispatch(addToCart({
  codigo: "ABC123",
  nombre: "Producto X",
  precio: 100.50,
  cantidad: 2,
  image: "/img/producto.jpg"
}));
```

**Reducir cantidad:**
```typescript
dispatch(removeFromCart("ABC123")); // Reduce en 1
```

**Eliminar completamente:**
```typescript
dispatch(removeFromCart({ codigo: "ABC123", removeCompletely: true }));
```

**Vaciar carrito:**
```typescript
dispatch(clearCart());
```

### Persistencia

El carrito se guarda automáticamente en `localStorage.cart` después de cada operación y se carga al iniciar la aplicación.

---

## Pedidos

### Crear Pedido

```typescript
const payload = {
  observ: "Observaciones del pedido",
  detalle: [
    { codigo: "ABC123", cantidad: 2, precio: 100.50 },
    { codigo: "DEF456", cantidad: 1, precio: 200.00 },
  ]
};

const response = await apiService.createPedido(payload);
```

### Estructura de Respuesta

```typescript
interface Pedido {
  compro: string;              // Número de comprobante
  detalles: PedidoDetalle[];   // Items del pedido
  nrocli: number;              // Número de cliente
  fecped: string;              // Fecha del pedido
  observ: string;              // Observaciones
  // ... más campos
}
```

---

## Estilos y Diseño

### Sistema de Colores

| Uso | Color | Clase Tailwind |
|-----|-------|----------------|
| Primario | Azul | `blue-600`, `blue-700`, `blue-900` |
| Éxito | Verde | `green-600`, `green-100` |
| Advertencia | Ámbar | `amber-100`, `amber-700` |
| Error | Rojo | `red-600`, `red-100` |
| Neutro | Gris | `gray-50` a `gray-900` |

### Breakpoints Responsive

| Breakpoint | Ancho | Uso |
|------------|-------|-----|
| `sm` | 640px | Tablets pequeñas |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |

### Componentes UI Reutilizables

- **Badges**: `px-2 py-0.5 rounded-md text-xs font-medium`
- **Botones primarios**: `bg-blue-600 hover:bg-blue-700 text-white rounded-lg`
- **Botones secundarios**: `border border-gray-300 hover:bg-gray-50 rounded-lg`
- **Inputs**: `h-9 px-3 rounded-lg border-0 focus:ring-2`

---

## Testing

### Configuración

Tests con Jest y React Testing Library.

```bash
npm run test              # Ejecutar todos los tests
npm run test:watch        # Modo watch
npm run test:coverage     # Con reporte de cobertura
```

### Estructura de Tests

```
__tests__/
├── components/
│   └── ProductCard.test.tsx
└── redux/
    ├── cartSlice.test.ts
    └── filtersSlice.test.ts
```

### Ejemplo de Test

```typescript
// __tests__/redux/cartSlice.test.ts
describe('cartSlice', () => {
  it('should add item to cart', () => {
    const state = cartReducer(undefined, addToCart(mockItem));
    expect(state.items).toHaveLength(1);
  });
});
```

---

## Personalización para Nuevos Clientes

### 1. Configuración Básica

**`app/layout.tsx`** - Cambiar metadata:
```typescript
export const metadata: Metadata = {
  title: "Nombre del Cliente",
  description: "Descripción del negocio",
};
```

**`.env.local`** - URL de la API:
```env
NEXT_PUBLIC_API_URL=https://api.cliente.com/api
```

### 2. Branding

**Logos:** Reemplazar en `/public/images/logos/`
- Logo header
- Logo footer
- Favicon

**Colores:** Modificar `tailwind.config.ts` o buscar/reemplazar:
- `blue-600` → color primario
- `blue-900` → color header

### 3. Imágenes de Productos

**`next.config.ts`** - Agregar dominio de imágenes:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'api.nuevocliente.com',
      pathname: '/media/Imagenes/**',
    },
  ],
},
```

### 4. WhatsApp

**`WhatsAppButton.tsx`** o donde se use:
```typescript
<WhatsAppButton
  phoneNumber="+54XXXXXXXXXX"
  message="Hola, estoy interesado en productos..."
/>
```

### 5. Información de Contacto

Modificar en:
- `Footer.tsx` - Datos de contacto
- `BankInfoModal.tsx` - Datos bancarios para transferencias

### 6. Textos y Labels

Buscar y reemplazar textos específicos del cliente por el nuevo nombre antes de cada deploy.

---

## Despliegue

### Build de Producción

```bash
npm run build
npm run start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Entorno en Producción

```env
NEXT_PUBLIC_API_URL=https://api.produccion.com/api
NODE_ENV=production
```

---

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL base de la API backend | `http://localhost:8001/api` |
| `NODE_ENV` | Entorno de ejecución | `development`, `production` |

---

## Troubleshooting

### Error: "Token expirado"
El sistema hace logout automático y redirige a `/login`. El usuario debe volver a iniciar sesión.

### Error: Imágenes no cargan
1. Verificar que el dominio está en `next.config.ts` → `images.remotePatterns`
2. Verificar que la URL de la imagen es correcta
3. El componente usa imagen fallback `/Caja.webp` si falla

### Error: Filtros no se aplican
1. Verificar que `useUrlFilters` está inicializado (`isInitialized === true`)
2. Verificar consola para errores de API
3. Verificar que los parámetros de filtro coinciden con lo que espera el backend

### Error: Carrito no persiste
1. Verificar que localStorage está disponible (no en modo incógnito con restricciones)
2. Verificar consola para errores al guardar/cargar

---

## Contacto y Soporte

Para soporte técnico o consultas sobre personalización, contactar al equipo de desarrollo.

---

*Documentación generada para proyecto_base_frontend v0.1.0*
*Última actualización: Enero 2026*
