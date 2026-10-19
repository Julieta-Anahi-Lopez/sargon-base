"use client";

import { AlertTriangle, X, Check, Trash2 } from "lucide-react";
import { capitalizar } from "@/lib/format";

export interface SinStockItem {
  codigo:     string;
  nombre:     string;
  disponible: number;
  solicitado: number;
}

interface Props {
  items:        SinStockItem[];
  onAdjust:     (codigo: string) => void;
  onRemove:     (codigo: string) => void;
  onResolveAll: () => void;
  onClose:      () => void;
}

export function StockResolutionModal({ items, onAdjust, onRemove, onResolveAll, onClose }: Props) {
  const allZero = items.every((i) => i.disponible === 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Stock insuficiente
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {items.length === 1
                  ? "1 artículo necesita tu atención"
                  : `${items.length} artículos necesitan tu atención`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items list — scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
          {items.map((item) => (
            <div key={item.codigo} className="p-4 space-y-2">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 leading-snug">
                {capitalizar(item.nombre)}
              </p>

              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                <span>
                  Pedías{" "}
                  <strong className="text-stone-700 dark:text-stone-300">{item.solicitado}</strong>
                </span>
                <span>·</span>
                {item.disponible > 0 ? (
                  <span>
                    Hay{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">{item.disponible}</strong>
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">Sin stock</span>
                )}
              </div>

              <div className="flex gap-2 pt-0.5">
                {item.disponible > 0 && (
                  <button
                    onClick={() => onAdjust(item.codigo)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-brand/40 text-brand hover:bg-brand-light text-xs font-medium py-2 transition-colors"
                  >
                    <Check size={13} />
                    Ajustar a {item.disponible}
                  </button>
                )}
                <button
                  onClick={() => onRemove(item.codigo)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium py-2 transition-colors ${
                    item.disponible > 0 ? "px-3" : "flex-1"
                  }`}
                >
                  <Trash2 size={13} />
                  {item.disponible === 0 ? "Quitar del carrito" : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-sm font-medium py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onResolveAll}
            className="flex-1 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-medium py-2.5 transition-colors"
          >
            {allZero ? "Quitar todos" : "Resolver todos"}
          </button>
        </div>
      </div>
    </div>
  );
}
