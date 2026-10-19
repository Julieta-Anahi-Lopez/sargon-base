"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import type { FiltersState, PaginatedProductsResponse } from "@/types";

interface ProductFilters {
  nromar?: string | number | null;
  nombre?: string | null;
  nrogru?: string | null;
  nrosub?: string | null;
  precio_max?: number | null;
  ordering?: string | null;
  solo_stock?: boolean;
  page?: number;
}

/**
 * Hook para obtener productos paginados con React Query.
 * Incluye caché automático, refetch, y estados de loading/error.
 *
 * La respuesta del backend es paginada: { count, total_pages, current_page, page_size, next, previous, results }
 * El param de subrubro es 'nrosub' (no 'subrubro') — coincide con el campo de la URL en el backend.
 */
export function useProducts(
  filters: FiltersState,
  page: number = 1,
  enabled: boolean = true,
  isAuthenticated: boolean = false,
) {
  const productFilters: ProductFilters = {
    nromar: filters.nromar,
    nombre: filters.nombre,
    nrogru: filters.category,
    nrosub: filters.subcategory,
    precio_max: filters.precio_max,
    ordering:   filters.ordering,
    solo_stock: filters.solo_stock || undefined,
    page,
  };

  return useQuery<PaginatedProductsResponse>({
    // isAuthenticated en la key garantiza que al loguearse React Query
    // trate el resultado como una query distinta y re-fetche con el token,
    // evitando que se sirva la respuesta anónima (sin precios) cacheada.
    queryKey: ["products", productFilters, isAuthenticated],
    queryFn: async () => {
      const data = await apiService.getProducts(productFilters);
      return data as PaginatedProductsResponse;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}
