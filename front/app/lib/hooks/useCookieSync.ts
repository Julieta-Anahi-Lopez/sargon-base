// app/lib/hooks/useCookieSync.ts
'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

/**
 * Hook para sincronizar el token de autenticación con cookies
 * Esto permite que el middleware de Next.js pueda verificar la autenticación
 */
export function useCookieSync() {
  const token = useSelector((state: RootState) => state.auth?.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isAuthenticated && token) {
      // Guardar token en cookie (httpOnly: false para que JS pueda accederla)
      // maxAge: 7 días en segundos
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      // Eliminar cookie si no está autenticado
      document.cookie = 'auth_token=; path=/; max-age=0';
    }
  }, [token, isAuthenticated]);
}

/**
 * Función helper para eliminar la cookie de autenticación
 */
export function clearAuthCookie() {
  if (typeof window === 'undefined') return;
  document.cookie = 'auth_token=; path=/; max-age=0';
}

/**
 * Función helper para obtener el token desde cookies
 */
export function getAuthTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token') {
      return value || null;
    }
  }
  return null;
}
