import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  logout,
  loginUser,
  initializeAuth,
} from '@/redux/slices/authSlice';

// Tipado mínimo para el estado de auth
interface AuthState {
  user: null | Record<string, unknown>;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

function makeStore(preloadedState?: { auth: Partial<AuthState> }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
}

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    global.fetch = jest.fn();
    // Mock document.cookie (jsdom lo soporta, pero lo reseteamos)
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('estado inicial', () => {
    it('debería tener el estado inicial correcto', () => {
      const state = authReducer(undefined, { type: 'unknown' });

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.initialized).toBe(false);
    });
  });

  describe('acción logout', () => {
    it('debería limpiar user, token, refreshToken e isAuthenticated', () => {
      const store = makeStore({
        auth: {
          user: { nombre: 'Juan' },
          token: 'abc123',
          refreshToken: 'ref456',
          isAuthenticated: true,
          initialized: true,
        },
      });

      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('thunk loginUser', () => {
    it('login exitoso: debería guardar token, user e isAuthenticated=true', async () => {
      const mockUser = { codigo: '001', nombre: 'Juan', catusu: 'C' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access: 'token-de-acceso',
          refresh: 'token-de-refresco',
          user: mockUser,
        }),
      });

      const store = makeStore();
      await store.dispatch(loginUser({ email: 'juan@test.com', clave: '1234' }));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe('token-de-acceso');
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it('login fallido (401): debería tener error e isAuthenticated=false', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Credenciales inválidas' }),
      });

      const store = makeStore();
      await store.dispatch(loginUser({ email: 'juan@test.com', clave: 'mal' }));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.token).toBeNull();
      expect(state.error).toBe('Credenciales inválidas');
    });
  });

  describe('thunk initializeAuth', () => {
    it('sin token en localStorage → initialized=true, isAuthenticated=false', async () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const store = makeStore();
      await store.dispatch(initializeAuth());

      const state = store.getState().auth;
      expect(state.initialized).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('con token y user en localStorage → initialized=true, isAuthenticated=true, user cargado', async () => {
      const mockUser = { codigo: '001', nombre: 'Juan', catusu: 'C' };
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'auth_token') return 'token-guardado';
        if (key === 'refresh_token') return 'refresh-guardado';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      const store = makeStore();
      await store.dispatch(initializeAuth());

      const state = store.getState().auth;
      expect(state.initialized).toBe(true);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('token-guardado');
    });
  });
});
