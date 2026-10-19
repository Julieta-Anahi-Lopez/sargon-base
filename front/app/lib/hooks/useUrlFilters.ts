// app/lib/hooks/useUrlFilters.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface Filters {
  category: string | null;
  subcategory: string | null;
  precio_max: number | null;
  nromar: string | null;
  nombre: string | null;
}

const defaultFilters: Filters = {
  category: null,
  subcategory: null,
  precio_max: null,
  nromar: null,
  nombre: null,
};

/**
 * Hook que sincroniza los filtros con los query params de la URL
 * Permite que los filtros persistan al recargar la página y que las URLs sean compartibles
 */
export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const isFirstRender = useRef(true);

  // Estado de filtros - siempre iniciar con default para evitar problemas de hidratación
  const [filters, setFiltersState] = useState<Filters>(defaultFilters);

  // Inicializar desde URL solo en cliente, después del montaje
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters: Filters = {
      category: params.get('category'),
      subcategory: params.get('subcategory'),
      precio_max: params.get('precio_max') ? Number(params.get('precio_max')) : null,
      nromar: params.get('nromar'),
      nombre: params.get('nombre'),
    };

    // Solo actualizar si hay filtros en la URL
    const hasFilters = Object.values(urlFilters).some(v => v !== null);
    if (hasFilters) {
      setFiltersState(urlFilters);
    }

    setIsInitialized(true);
  }, []);

  // Sincronizar URL cuando cambian los filtros (después de la inicialización)
  useEffect(() => {
    // Saltar el primer render para evitar actualizar la URL innecesariamente
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isInitialized) return;

    const params = new URLSearchParams();

    // Solo agregar parámetros que tengan valor
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Usar replace para no llenar el historial
    router.replace(newUrl, { scroll: false });
  }, [filters, isInitialized, pathname, router]);

  // Actualizar filtros
  const setFilters = useCallback((newFilters: Filters | ((prev: Filters) => Filters)) => {
    setFiltersState(prev => {
      const updated = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      return updated;
    });
  }, []);

  // Actualizar un filtro específico
  const updateFilter = useCallback((key: keyof Filters, value: string | number | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, [setFilters]);

  // Establecer categoría y subcategoría
  const setCategory = useCallback((category: string | null, subcategory?: string | null) => {
    setFilters(prev => ({
      ...prev,
      category,
      subcategory: subcategory ?? null,
    }));
  }, [setFilters]);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filters).some(
    value => value !== null && value !== undefined && value !== ''
  );

  return {
    filters,
    setFilters,
    updateFilter,
    setCategory,
    clearFilters,
    hasActiveFilters,
    isInitialized,
  };
}
