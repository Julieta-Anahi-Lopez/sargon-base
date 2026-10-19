"use client";
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/redux/hooks';
import type { RootState } from '@/redux/store';
import { initializeAuth } from '@/redux/slices/authSlice';
import { useCookieSync } from '@/app/lib/hooks/useCookieSync';
import { useCartSync } from '@/app/lib/hooks/useCartSync';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useSelector((s: RootState) => s.auth.initialized);

  useCookieSync();
  useCartSync();

  useEffect(() => {
    if (!initialized) dispatch(initializeAuth());
  }, [initialized, dispatch]);

  return <>{children}</>;
}