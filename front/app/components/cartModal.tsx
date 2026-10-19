"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, Package2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearCart } from "@/redux/slices/cartSlice";
import { useAuth } from "../lib/hooks/useAuth";
import type { Pedido, OrderResult } from "@/types";

// Subcomponentes
import { CartItemRow, OrderSummary, OrdersList, BankInfoModal } from "./cart";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidos: Pedido[];
  pedidosLoading: boolean;
  onSubmitOrder: (
    observaciones: string,
    items: { codigo: string; cantidad: number; precio: number }[]
  ) => Promise<OrderResult>;
}

export default function CartModal({
  isOpen,
  onClose,
  pedidos = [],
  pedidosLoading = false,
  onSubmitOrder,
}: CartModalProps) {
  const [activeTab, setActiveTab] = useState<"cart" | "orders">("cart");
  const [showBankModal, setShowBankModal] = useState(false);
  const [pedidoTotal, setPedidoTotal] = useState(0);
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  // Obtener items del carrito desde Redux
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const handleOrderSuccess = (total: number) => {
    setPedidoTotal(total);
    dispatch(clearCart());
    setShowBankModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-3xl p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Mi Carrito</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-xl leading-none"
              aria-label="Cerrar"
            >
              ✖
            </button>
          </div>

          {/* Pestañas */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex items-center px-4 py-2 font-medium ${
                activeTab === "cart"
                  ? "text-amber-600 border-b-2 border-amber-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <ShoppingCart size={18} className="mr-2" />
              <span>Carrito</span>
              {cartItems.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-medium rounded-full px-2 py-0.5">
                  {cartItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center px-4 py-2 font-medium ${
                activeTab === "orders"
                  ? "text-amber-600 border-b-2 border-amber-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Package2 size={18} className="mr-2" />
              <span>Mis Pedidos</span>
              {pedidos.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-medium rounded-full px-2 py-0.5">
                  {pedidos.length}
                </span>
              )}
            </button>
          </div>

          {/* Contenido: Carrito */}
          {activeTab === "cart" && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-4">
                    <ShoppingCart size={64} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Parece que aún no has agregado productos a tu carrito
                  </p>
                  <Link
                    href="/catalogo"
                    className="bg-amber-600 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-700 transition-colors"
                    onClick={onClose}
                  >
                    Ver productos
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Lista de productos */}
                  <div className="lg:w-2/3">
                    <div className="max-h-96 overflow-y-auto pr-2">
                      {cartItems.map((item) => (
                        <CartItemRow key={item.codigo} item={item} />
                      ))}
                    </div>

                    <button
                      onClick={() => dispatch(clearCart())}
                      className="mt-4 text-red-500 hover:text-red-700 text-sm flex items-center"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Vaciar carrito
                    </button>
                  </div>

                  {/* Resumen del pedido */}
                  <OrderSummary
                    cartItems={cartItems}
                    cartTotal={cartTotal}
                    user={user}
                    isAuthenticated={isAuthenticated}
                    onSubmitOrder={onSubmitOrder}
                    onOrderSuccess={handleOrderSuccess}
                  />
                </div>
              )}
            </>
          )}

          {/* Contenido: Pedidos */}
          {activeTab === "orders" && (
            <div className="py-2 px-1">
              <OrdersList pedidos={pedidos} isLoading={pedidosLoading} />
            </div>
          )}

          {/* Botón cerrar */}
          <div className="border-t pt-4 mt-4">
            <button
              onClick={onClose}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Modal de información bancaria */}
        <BankInfoModal
          isOpen={showBankModal}
          onClose={() => setShowBankModal(false)}
          total={pedidoTotal}
        />
      </div>
    </div>
  );
}
