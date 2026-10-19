// components/withAuth.tsx
"use client";
import { useRouter } from 'next/navigation'; // Cambiado de next/router a next/navigation para Next.js 13+
import { useEffect } from 'react';
import { useSelector } from 'react-redux'; // Usar useSelector directamente
import { ComponentType } from 'react';
import { RootState } from '@/store';

// Selectores fuera del componente
const selectAuth = (state: RootState) => state.auth;

// HOC para proteger rutas que requieren autenticación
const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const WithAuthComponent = (props: P) => {
    const auth = useSelector(selectAuth);
    const router = useRouter();

    useEffect(() => {
      // Solo verificar una vez que la autenticación está inicializada
      if (auth.initialized && !auth.isAuthenticated) {
        router.replace('/login');
      }
    }, [auth.initialized, auth.isAuthenticated, router]);

    // Mientras verifica autenticación, mostrar spinner
    if (!auth.initialized || (auth.initialized && !auth.isAuthenticated)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      );
    }

    // Si está autenticado, renderizar el componente protegido
    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;