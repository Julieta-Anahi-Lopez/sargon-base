"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo que los datos se consideran "frescos" (5 minutos)
            staleTime: 5 * 60 * 1000,
            // Tiempo que los datos permanecen en caché (30 minutos)
            gcTime: 30 * 60 * 1000,
            // Reintentar 2 veces en caso de error
            retry: 2,
            // No refetch en focus por defecto
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
