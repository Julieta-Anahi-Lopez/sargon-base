"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import type { CartItem as CartItemType } from "@/types";
import { capitalizar } from "@/lib/format";

export function CartItem({ item }: { item: CartItemType }) {
  const dispatch = useDispatch();
  const subtotal = item.precio * item.cantidad;
  const atMax    = item.stock != null && item.cantidad >= item.stock;

  return (
    <div className="flex gap-3 py-3">
      {/* Image */}
      <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.nombre}
          fill
          className="object-contain p-1"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
          {capitalizar(item.nombre)}
        </p>
        <p className="text-xs text-stone-400 mt-0.5">${item.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })} c/u</p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center rounded-md border border-stone-200 dark:border-stone-700 overflow-hidden">
            <button
              onClick={() => dispatch(removeFromCart(item.codigo))}
              className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Minus size={13} />
            </button>
            <span className="w-8 text-center text-sm font-medium text-stone-900 dark:text-stone-100">
              {item.cantidad}
            </span>
            <button
              onClick={() => dispatch(addToCart({ ...item, cantidad: 1 }))}
              disabled={atMax}
              title={atMax ? "Stock máximo alcanzado" : undefined}
              className="w-7 h-7 flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>

          {atMax && (
            <span className="text-[10px] font-semibold text-amber-500 dark:text-amber-400 leading-none">
              Máx.
            </span>
          )}

          <button
            onClick={() => dispatch(removeFromCart({ codigo: item.codigo, removeCompletely: true }))}
            className="ml-auto p-1.5 text-stone-400 hover:text-red-500 transition-colors"
            aria-label="Eliminar"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <p className="text-sm font-semibold text-amber-600 dark:text-amber-500 shrink-0">
        ${subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
