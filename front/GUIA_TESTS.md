# Guía de Tests - Frontend Base E-commerce

## Cómo correr los tests

### Comandos básicos

```bash
# Correr todos los tests una vez
npm run test

# Correr tests en modo watch (se re-ejecutan al guardar cambios)
npm run test:watch

# Correr tests con reporte de cobertura
npm run test:coverage
```

### Correr tests específicos

```bash
# Correr tests de un archivo específico
npm test -- cartSlice

# Correr tests de una carpeta específica
npm test -- __tests__/redux

# Correr tests que coincidan con un patrón
npm test -- --testPathPattern="ProductCard"

# Correr un test específico por nombre
npm test -- -t "debería agregar un item al carrito"
```

### Opciones útiles

```bash
# Ver más detalles de cada test
npm test -- --verbose

# Correr solo tests que fallaron anteriormente
npm test -- --onlyFailures

# Actualizar snapshots (si usas)
npm test -- --updateSnapshot
```

---

## Estructura de tests

```
__tests__/
├── components/           # Tests de componentes React
│   ├── ProductCard.test.tsx
│   ├── Modal.test.tsx
│   └── ScrollToTop.test.tsx
├── redux/               # Tests de Redux slices
│   ├── cartSlice.test.ts
│   └── filtersSlice.test.ts
├── hooks/               # Tests de hooks personalizados
│   └── useAuth.test.ts
└── utils/               # Tests de utilidades
    └── formatters.test.ts
```

---

## Qué testean los tests actuales

### Redux Slices

**cartSlice.test.ts** - Carrito de compras
- ✅ Agregar items al carrito
- ✅ Incrementar cantidad de item existente
- ✅ Remover items (reducir cantidad o eliminar)
- ✅ Vaciar carrito
- ✅ Persistencia en localStorage
- ✅ Cargar carrito desde localStorage

**filtersSlice.test.ts** - Filtros del catálogo
- ✅ Establecer categoría y subcategoría
- ✅ Establecer múltiples filtros
- ✅ Limpiar filtros
- ✅ Detectar filtros activos

### Componentes

**ProductCard.test.tsx** - Tarjeta de producto
- ✅ Renderizado básico (código, nombre, precio)
- ✅ Estados de stock (disponible, pocos, sin stock)
- ✅ Selector de cantidad (+/-)
- ✅ Agregar al carrito
- ✅ Estados de autenticación
- ✅ Modal de información

**Modal.test.tsx** - Modal reutilizable
- ✅ Renderizado condicional
- ✅ Información de producto
- ✅ Estado de stock
- ✅ Precio formateado
- ✅ Botón agregar al carrito
- ✅ Cerrar con X, Escape, clic fuera
- ✅ Bloqueo de scroll

**ScrollToTop.test.tsx** - Botón volver arriba
- ✅ Visibilidad según scroll
- ✅ Threshold personalizado
- ✅ Funcionalidad de scroll
- ✅ Accesibilidad

### Hooks

**useAuth.test.ts** - Autenticación
- ✅ Estado sin autenticación
- ✅ Estado con token válido
- ✅ Carga de datos de usuario
- ✅ Manejo de errores
- ✅ Función logout

### Utilidades

**formatters.test.ts** - Funciones de formateo
- ✅ normalizeText (capitalización)
- ✅ formatPrice (formato argentino)
- ✅ getStockStatus
- ✅ Funciones de filtros

---

## Cómo escribir nuevos tests

### Test básico de componente

```tsx
import { render, screen } from '@testing-library/react';
import MiComponente from '@/app/components/MiComponente';

describe('MiComponente', () => {
  it('debería renderizar correctamente', () => {
    render(<MiComponente />);

    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

### Test con Redux

```tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/redux/slices/cartSlice';
import MiComponente from '@/app/components/MiComponente';

const createMockStore = () =>
  configureStore({
    reducer: { cart: cartReducer },
  });

describe('MiComponente', () => {
  it('debería funcionar con Redux', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MiComponente />
      </Provider>
    );

    // Verificar estado del store
    expect(store.getState().cart.items).toHaveLength(0);
  });
});
```

### Test con interacción de usuario

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MiComponente', () => {
  it('debería manejar clicks', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<button onClick={handleClick}>Click me</button>);

    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Test de Redux slice

```typescript
import miReducer, { miAccion } from '@/redux/slices/miSlice';

describe('miSlice', () => {
  it('debería manejar la acción', () => {
    const estadoInicial = { valor: 0 };

    const nuevoEstado = miReducer(estadoInicial, miAccion(5));

    expect(nuevoEstado.valor).toBe(5);
  });
});
```

---

## Buenas prácticas

### 1. Nombrar tests descriptivamente
```typescript
// ❌ Malo
it('test 1', () => {});

// ✅ Bueno
it('debería agregar un producto al carrito cuando el usuario hace clic', () => {});
```

### 2. Un assert por test (cuando sea posible)
```typescript
// ❌ Malo - múltiples conceptos
it('debería funcionar', () => {
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
});

// ✅ Bueno - separar conceptos
it('debería establecer valor A', () => {
  expect(a).toBe(1);
});

it('debería establecer valor B', () => {
  expect(b).toBe(2);
});
```

### 3. Usar describe para agrupar
```typescript
describe('MiComponente', () => {
  describe('cuando está autenticado', () => {
    it('debería mostrar botón de logout', () => {});
  });

  describe('cuando NO está autenticado', () => {
    it('debería mostrar botón de login', () => {});
  });
});
```

### 4. Limpiar entre tests
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

---

## Solución de problemas comunes

### "Cannot find module '@/...'"
El path alias está configurado en `jest.config.js`. Verificá que el archivo exista.

### "localStorage is not defined"
localStorage está mockeado en `jest.setup.js`. Si necesitás un comportamiento específico:
```typescript
localStorage.getItem = jest.fn().mockReturnValue('valor');
```

### "act(...) warning"
Envolvé actualizaciones de estado en `act()`:
```typescript
import { act } from '@testing-library/react';

act(() => {
  // código que actualiza estado
});
```

### Tests de componentes con next/image
Está mockeado en `jest.setup.js`. Si ves errores, agregá el mock en tu test:
```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));
```

---

## Cobertura de tests

Después de correr `npm run test:coverage`, se genera un reporte en:
- Terminal: resumen de cobertura
- `coverage/lcov-report/index.html`: reporte visual detallado

### Métricas de cobertura:
- **Statements**: líneas de código ejecutadas
- **Branches**: caminos de if/else cubiertos
- **Functions**: funciones llamadas
- **Lines**: líneas totales cubiertas

### Objetivo recomendado:
- Statements: > 70%
- Branches: > 60%
- Functions: > 70%

---

## Recursos útiles

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)

---

*Última actualización: Enero 2026*
