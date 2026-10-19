import { renderHook, act } from '@testing-library/react';
import { useAuth, logoutGlobal } from '@/app/lib/hooks/useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('estado inicial', () => {
    it('debería retornar isAuthenticated false sin token', () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });

    it('debería retornar authChecked true después de verificar', async () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => useAuth());

      // authChecked se pone en true después del useEffect
      expect(result.current.authChecked).toBe(true);
    });
  });

  describe('con token válido', () => {
    it('debería retornar isAuthenticated true con token', () => {
      localStorage.getItem = jest.fn().mockImplementation((key) => {
        if (key === 'auth_token') return 'valid-token';
        return null;
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('valid-token');
    });

    it('debería cargar datos del usuario', () => {
      const mockUser = { nombre: 'Test User', email: 'test@example.com' };
      localStorage.getItem = jest.fn().mockImplementation((key) => {
        if (key === 'auth_token') return 'valid-token';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.user?.nombre).toBe('Test User');
    });
  });

  describe('manejo de errores', () => {
    it('debería manejar JSON inválido en user', () => {
      localStorage.getItem = jest.fn().mockImplementation((key) => {
        if (key === 'auth_token') return 'valid-token';
        if (key === 'user') return 'invalid-json';
        return null;
      });

      // No debería lanzar error
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeNull();
    });
  });
});

describe('logoutGlobal', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('debería eliminar auth_token de localStorage', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.removeItem = jest.fn();

    logoutGlobal();

    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('debería eliminar refresh_token de localStorage', () => {
    localStorage.setItem('refresh_token', 'test-refresh');
    localStorage.removeItem = jest.fn();

    logoutGlobal();

    expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
  });

  it('debería eliminar user de localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ nombre: 'Test' }));
    localStorage.removeItem = jest.fn();

    logoutGlobal();

    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
