"use client";

import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import type { Rubro, Marca } from "@/types";

/**
 * Hook para obtener rubros/categorías con React Query
 */
export function useRubros() {
  return useQuery<Rubro[]>({
    queryKey: ["rubros"],
    queryFn: async () => {
      const data = await apiService.getRubros();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - categorías cambian poco
  });
}

/**
 * Hook para obtener marcas con React Query
 */
export function useMarcas() {
  return useQuery<Marca[]>({
    queryKey: ["marcas"],
    queryFn: async () => {
      const data = await apiService.getMarcas();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}
