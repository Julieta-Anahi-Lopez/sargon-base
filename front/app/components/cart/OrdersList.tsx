"use client";

import { Package2 } from "lucide-react";
import type { Pedido } from "@/types";

interface OrdersListProps {
  pedidos: Pedido[];
  isLoading: boolean;
}

// Formatear fecha de pedido
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Formatear número de pedido
const formatOrderNumber = (compro: string) => {
  const parts = compro.split("-");
  return parts.length > 1 ? parts[1] : compro;
};

export default function OrdersList({ pedidos, isLoading }: OrdersListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Cargando tus pedidos...</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <Package2 size={64} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No tienes pedidos previos
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Cuando realices pedidos, aparecerán aquí para que puedas consultarlos
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto pr-2">
      <div className="grid gap-4">
        {pedidos.map((pedido) => (
          <div
            key={pedido.compro}
            className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200">
                  Pedido #{formatOrderNumber(pedido.compro)}
                </h4>
                <p className="text-xs text-gray-500">{formatDate(pedido.fecped)}</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                {pedido.detalles.length} artículos
              </span>
            </div>

            {/* Detalles del pedido */}
            <div className="space-y-2 mb-3">
              {pedido.detalles.map((detalle) => (
                <div
                  key={`${pedido.compro}-${detalle.nroord}`}
                  className="flex justify-between text-sm py-1 border-b border-gray-200 dark:border-gray-600 last:border-0"
                >
                  <div className="flex-grow">
                    <p className="text-gray-800 dark:text-gray-200 font-medium truncate">{detalle.descri}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{detalle.cantid} unidad(es)</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-amber-600">
                      ${(detalle.precio * detalle.cantid).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">${detalle.precio.toFixed(2)} c/u</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total y observaciones */}
            <div className="mt-3 pt-2 border-t">
              {pedido.observ && pedido.observ !== "Sin observaciones" && (
                <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                  <span className="font-medium">Observaciones:</span> {pedido.observ}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total del pedido:</span>
                <span className="font-bold text-amber-700 text-lg">
                  $
                  {pedido.detalles
                    .reduce((sum, item) => sum + item.precio * item.cantid, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
