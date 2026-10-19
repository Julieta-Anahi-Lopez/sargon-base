"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import type { CartItem } from "@/types";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const dispatch = useDispatch();

  const handleDecrease = () => {
    if (item.cantidad > 1) {
      dispatch(removeFromCart(item.codigo));
    } else {
      dispatch(removeFromCart({ codigo: item.codigo, removeCompletely: true }));
    }
  };

  const handleIncrease = () => {
    dispatch(addToCart({ ...item, cantidad: 1 }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart({ codigo: item.codigo, removeCompletely: true }));
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b dark:border-gray-700">
      {/* Imagen del producto */}
      <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded border dark:border-gray-700 overflow-hidden">
        <Image
          src={item.image}
          alt={item.nombre}
          fill
          className="object-contain"
        />
      </div>

      {/* Información del producto */}
      <div className="flex-grow">
        <h4 className="font-medium text-gray-800 dark:text-gray-200">{item.nombre}</h4>
        <div className="flex items-center mt-2">
          <div className="flex items-center border dark:border-gray-600 rounded-md">
            <button
              onClick={handleDecrease}
              className="px-2 py-1 text-amber-600 hover:bg-amber-50"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>
            <span className="px-2 text-gray-700 dark:text-gray-300 text-sm font-medium">
              {item.cantidad}
            </span>
            <button
              onClick={handleIncrease}
              className="px-2 py-1 text-amber-600 hover:bg-amber-50"
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={handleRemove}
            className="ml-4 text-red-500 hover:text-red-700"
            aria-label="Eliminar producto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Precio */}
      <div className="text-right">
        <div className="font-semibold text-amber-600">
          ${(item.precio * item.cantidad).toFixed(2)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          ${item.precio.toFixed(2)} por unidad
        </div>
      </div>
    </div>
  );
}
