"use client";

import { useState } from "react";
import type { CartItem, User, OrderResult, StockErrorItem } from "@/types";

interface OrderSummaryProps {
  cartItems: CartItem[];
  cartTotal: number;
  user: User | Record<string, string>;
  isAuthenticated: boolean;
  onSubmitOrder: (
    observaciones: string,
    items: { codigo: string; cantidad: number; precio: number }[]
  ) => Promise<OrderResult>;
  onOrderSuccess: (total: number) => void;
}

const MIN_TOTAL = 50000;

export default function OrderSummary({
  cartItems,
  cartTotal,
  user,
  isAuthenticated,
  onSubmitOrder,
  onOrderSuccess,
}: OrderSummaryProps) {
  const [observaciones, setObservaciones] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<StockErrorItem[]>([]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setSubmitError("Debes iniciar sesión para enviar un pedido.");
      return;
    }

    if (isSubmitting || cartItems.length === 0 || cartTotal < MIN_TOTAL) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setStockErrors([]);

    try {
      const simplifiedItems = cartItems.map(({ codigo, cantidad, precio }) => ({
        codigo,
        cantidad,
        precio,
      }));

      const result = await onSubmitOrder(observaciones, simplifiedItems);

      if (result.success) {
        onOrderSuccess(cartTotal);
        setObservaciones("");
      } else if (result.stockError && result.stockError.length > 0) {
        // Stock insuficiente: mostrar detalle sin limpiar el carrito
        setStockErrors(result.stockError);
      } else {
        setSubmitError("Ocurrió un error al enviar el pedido. Por favor, intente nuevamente.");
      }
    } catch {
      setSubmitError("Ocurrió un error al enviar el pedido. Por favor, intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || cartItems.length === 0 || cartTotal < MIN_TOTAL;

  return (
    <div className="lg:w-1/3 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 pb-2 border-b dark:border-gray-600">
        Resumen del pedido
      </h3>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
          <span className="text-gray-700 dark:text-gray-300">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-900 dark:text-gray-100">Envío</span>
          <span className="text-amber-600">A calcular</span>
        </div>
        <div className="pt-2 border-t flex justify-between font-bold">
          <span className="text-gray-700 dark:text-gray-300">Total</span>
          <span className="text-gray-900 dark:text-gray-100">${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Campo de observaciones */}
      <div className="mb-4">
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Observaciones para el pedido:
        </label>
        <textarea
          id="observaciones"
          className="w-full border text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={3}
          placeholder="Agregar instrucciones especiales o comentarios sobre el pedido..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      {/* Info adicional del usuario */}
      <div className="mt-4 border-t dark:border-gray-600 pt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div>
          <span className="font-bold">Dirección:</span>{" "}
          {user.domcal || "—"} {user.domnro || "—"}
        </div>
        <div>
          <span className="font-bold">CUIT / DNI:</span>{" "}
          {user.cuit && user.cuit !== "Sin cuit" ? user.cuit : user.dni || "—"}
        </div>
        <div>
          <span className="font-bold">Condición IVA:</span>{" "}
          {user.catIva || user.cativa || "Consumidor Final"}
        </div>
      </div>

      {/* Error de stock insuficiente */}
      {stockErrors.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 text-orange-800 p-3 rounded-md text-sm mb-4 mt-4">
          <p className="font-semibold mb-2">Algunos productos no tienen stock suficiente:</p>
          <ul className="space-y-1">
            {stockErrors.map(item => (
              <li key={item.codigo}>
                <span className="font-medium">{item.codigo}</span> — pediste{" "}
                <strong>{item.solicitado}</strong>, disponible:{" "}
                <strong>{item.disponible}</strong>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">Ajustá las cantidades y volvé a intentarlo. Tu carrito no fue modificado.</p>
        </div>
      )}

      {/* Error genérico de envío */}
      {submitError && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm mb-4 mt-4">
          {submitError}
        </div>
      )}

      {cartTotal < MIN_TOTAL && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm mb-4 mt-4 border border-yellow-300">
          Te faltan <strong>${(MIN_TOTAL - cartTotal).toFixed(2)}</strong> para alcanzar el mínimo de{" "}
          <strong>${MIN_TOTAL.toLocaleString()}</strong> requerido para realizar un pedido.
        </div>
      )}

      <button
        className={`w-full py-3 rounded-md font-medium transition-colors mt-4 ${
          isDisabled
            ? "bg-amber-400 cursor-not-allowed text-white"
            : "bg-amber-600 hover:bg-amber-700 text-white"
        }`}
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Enviando pedido...
          </span>
        ) : (
          "Realizar pedido"
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        Al hacer click, enviarás tu pedido a nuestro sistema. A continuación podés realizar el
        pago y enviar el comprobante por Whatsapp o bien, comunicarte con nosotros para
        coordinar pago y envío.
      </p>
    </div>
  );
}
