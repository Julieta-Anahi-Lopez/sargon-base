import { middleware } from '@/middleware';
import { NextResponse } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url) => ({ type: 'redirect', url: url.toString() })),
  },
}));

function makeRequest(pathname: string, token?: string) {
  return {
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    cookies: {
      get: (name: string) =>
        token && name === 'auth_token' ? { value: token } : undefined,
    },
  } as any;
}

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rutas públicas', () => {
    it('ruta pública (/) sin token → debería llamar a NextResponse.next()', () => {
      middleware(makeRequest('/'));

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('rutas privadas', () => {
    it('/carrito sin token → debería redirigir a /login', () => {
      const result = middleware(makeRequest('/carrito')) as any;

      expect(result.type).toBe('redirect');
      expect(result.url).toContain('/login');
      expect(NextResponse.next).not.toHaveBeenCalled();
    });

    it('/carrito con token → debería llamar a NextResponse.next()', () => {
      middleware(makeRequest('/carrito', 'token-valido'));

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('/pedidos sin token → debería redirigir a /login', () => {
      const result = middleware(makeRequest('/pedidos')) as any;

      expect(result.type).toBe('redirect');
      expect(result.url).toContain('/login');
    });

    it('/vendedor/nuevo-usuario sin token → debería redirigir a /login', () => {
      const result = middleware(makeRequest('/vendedor/nuevo-usuario')) as any;

      expect(result.type).toBe('redirect');
      expect(result.url).toContain('/login');
    });
  });

  describe('rutas AUTH_ONLY (/login)', () => {
    it('/login sin token → debería llamar a NextResponse.next()', () => {
      middleware(makeRequest('/login'));

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('/login con token → debería redirigir a /catalogo', () => {
      const result = middleware(makeRequest('/login', 'token-valido')) as any;

      expect(result.type).toBe('redirect');
      expect(result.url).toContain('/catalogo');
    });
  });

  describe('rutas BLOCKED (/registro)', () => {
    it('/registro sin token → debería redirigir a /login', () => {
      const result = middleware(makeRequest('/registro')) as any;

      expect(result.type).toBe('redirect');
      expect(result.url).toContain('/login');
    });

    it('/registro con token → debería redirigir a /login igualmente', () => {
      const result = middleware(makeRequest('/registro', 'token-valido')) as any;

      expect(result.type).toBe('redirect');
      expect(result.url).toContain('/login');
    });
  });

  describe('rutas de recuperación de contraseña (públicas)', () => {
    it('/recuperar-password sin token → debería llamar a NextResponse.next()', () => {
      middleware(makeRequest('/recuperar-password'));

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('/recuperar-password con token → debería llamar a NextResponse.next()', () => {
      middleware(makeRequest('/recuperar-password', 'token-valido'));

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('/nueva-password sin token → debería llamar a NextResponse.next()', () => {
      middleware(makeRequest('/nueva-password'));

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('/nueva-password con token de auth → debería llamar a NextResponse.next()', () => {
      middleware(makeRequest('/nueva-password', 'token-valido'));

      expect(NextResponse.next).toHaveBeenCalledTimes(1);
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });
});
