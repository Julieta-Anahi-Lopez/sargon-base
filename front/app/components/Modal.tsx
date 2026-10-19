"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  codigo: string;
  children: React.ReactNode;
  stock?: number;
  precio?: number;
  onAddToCart?: (cantidad: number) => void;
  isAuthenticated?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  codigo,
  children,
  stock,
  precio,
  onAddToCart,
  isAuthenticated = false,
}: ModalProps) {
  // Cerrar con Escape
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Prevenir scroll del body y escuchar Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  // Cerrar al hacer clic en el backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Formatear precio
  const formatPrice = (price: number): string => {
    const fixed = price.toFixed(2);
    const [intPart, decPart] = fixed.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedInt},${decPart}`;
  };

  // Determinar estado del stock (sin mostrar cantidad exacta)
  const getStockStatus = () => {
    if (stock === undefined) return null;
    if (stock <= 0) return { label: "Sin stock", color: "bg-red-100 text-red-700" };
    if (stock <= 5) return { label: "¡Quedan pocos!", color: "bg-amber-100 text-amber-700" };
    return { label: "Disponible", color: "bg-green-100 text-green-700" };
  };

  const stockStatus = getStockStatus();

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.2s ease-out" }}
      >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        style={{ animation: "scaleIn 0.2s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 transition-all duration-200"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold">
                {codigo}
              </span>
              {stockStatus && (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Imagen y contenido */}
          <div className="px-6">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-inner">
              {children}
            </div>
          </div>

          {/* Precio */}
          {typeof precio === "number" && (
            <div className="px-6 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${formatPrice(precio)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">por unidad</span>
              </div>
            </div>
          )}

          {/* Footer con acciones */}
          <div className="px-6 py-5 mt-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Cerrar
              </button>
              {onAddToCart && (
                <button
                  onClick={() => onAddToCart(1)}
                  disabled={!isAuthenticated || (stock !== undefined && stock <= 0)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    !isAuthenticated || (stock !== undefined && stock <= 0)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow"
                  }`}
                >
                  Agregar al carrito
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
