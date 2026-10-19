"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import type { Pedido } from "@/types";

interface PedidoPayload {
  observ: string;
  detalle: { codigo: string; cantidad: number; precio: number }[];
}

/**
 * Hook para obtener pedidos del cliente con React Query
 */
export function usePedidos(isAuthenticated: boolean) {
  return useQuery<Pedido[]>({
    queryKey: ["pedidos"],
    queryFn: async () => {
      const data = await apiService.getPedidosCliente();
      return Array.isArray(data.results) ? data.results : [];
    },
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minuto para pedidos
  });
}

/**
 * Hook para crear un nuevo pedido
 */
export function useCreatePedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PedidoPayload) => {
      return await apiService.createPedido(payload);
    },
    onSuccess: () => {
      // Invalidar la caché de pedidos para que se recarguen
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}
