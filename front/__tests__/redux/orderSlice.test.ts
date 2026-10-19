import { configureStore } from '@reduxjs/toolkit';
import orderReducer, { resetOrderState, submitOrder } from '@/redux/slices/orderSlice';
import cartReducer from '@/redux/slices/cartSlice';
import authReducer from '@/redux/slices/authSlice';
import filtersReducer from '@/redux/slices/filtersSlice';

function makeStore(preloadedState?: Record<string, unknown>) {
  return configureStore({
    reducer: {
      order: orderReducer,
      cart: cartReducer,
      auth: authReducer,
      filters: filtersReducer,
    },
    preloadedState,
  });
}

describe('orderSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    global.fetch = jest.fn();
  });

  describe('estado inicial', () => {
    it('debería retornar el estado inicial correcto', () => {
      const state = orderReducer(undefined, { type: 'unknown' });

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBeNull();
      expect(state.orderId).toBeNull();
    });
  });

  describe('acción resetOrderState', () => {
    it('debería resetear loading, success y error', () => {
      const estadoPrevio = {
        loading: true,
        success: true,
        error: 'hubo un error',
        orderId: '123',
      };

      const state = orderReducer(estadoPrevio, resetOrderState());

      expect(state.loading).toBe(false);
      expect(state.success).toBe(false);
      expect(state.error).toBeNull();
      // orderId no se resetea en el slice (solo loading/success/error)
      expect(state.orderId).toBe('123');
    });
  });

  describe('thunk submitOrder', () => {
    it('pedido exitoso: debería marcar success=true y guardar orderId', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'pedido-99' }),
      });

      const store = makeStore({
        auth: {
          token: 'token-valido',
          user: { codigo: 'CLI001' },
          isAuthenticated: true,
          initialized: true,
          loading: false,
          error: null,
          refreshToken: null,
        },
        cart: {
          items: [
            { codigo: 'P001', nombre: 'Producto', precio: 500, cantidad: 2, image: '/img.jpg' },
          ],
        },
      });

      await store.dispatch(submitOrder());

      const state = store.getState().order;
      expect(state.success).toBe(true);
      expect(state.orderId).toBe('pedido-99');
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('pedido fallido: debería guardar el error y success=false', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Stock insuficiente' }),
      });

      const store = makeStore({
        auth: {
          token: 'token-valido',
          user: { codigo: 'CLI001' },
          isAuthenticated: true,
          initialized: true,
          loading: false,
          error: null,
          refreshToken: null,
        },
        cart: {
          items: [
            { codigo: 'P001', nombre: 'Producto', precio: 500, cantidad: 2, image: '/img.jpg' },
          ],
        },
      });

      await store.dispatch(submitOrder());

      const state = store.getState().order;
      expect(state.success).toBe(false);
      expect(state.error).toBe('Stock insuficiente');
      expect(state.loading).toBe(false);
    });

    it('sin token: debería rechazar con mensaje de autenticación', async () => {
      const store = makeStore({
        auth: {
          token: null,
          user: null,
          isAuthenticated: false,
          initialized: true,
          loading: false,
          error: null,
          refreshToken: null,
        },
        cart: { items: [] },
      });

      await store.dispatch(submitOrder());

      const state = store.getState().order;
      expect(state.success).toBe(false);
      expect(state.error).toMatch(/token/i);
    });
  });
});
