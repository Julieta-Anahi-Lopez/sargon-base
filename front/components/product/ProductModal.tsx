"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import type { Product } from "@/types";
import { capitalizar } from "@/lib/format";

const PLACEHOLDER = "/placeholder.svg";

interface Props {
  product:         Product;
  isAuthenticated: boolean;
  onClose:         () => void;
}

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">Sin stock</span>;
  if (stock <= 5)
    return <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-brand">Últimas {stock} unidades</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
      En stock
    </span>
  );
}

function ModalCarousel({ imagenes, nombre, sinStock }: { imagenes: Product["imagenes"]; nombre: string; sinStock: boolean }) {
  const images = imagenes?.length > 0
    ? imagenes.map((i) => i.foto_1).filter(Boolean)
    : [PLACEHOLDER];

  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const hasMultiple = images.length > 1;

  function goPrev() { setCurrent((c) => (c - 1 + images.length) % images.length); }
  function goNext() { setCurrent((c) => (c + 1) % images.length); }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) { if (diff > 0) goNext(); else goPrev(); }
  }

  return (
    <div className="relative select-none bg-transparent">
      {/* Sliding track */}
      <div
        className="relative aspect-square overflow-hidden"
        onTouchStart={hasMultiple ? onTouchStart : undefined}
        onTouchEnd={hasMultiple ? onTouchEnd : undefined}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ width: `${images.length * 100}%`, transform: `translateX(-${current * (100 / images.length)}%)` }}
        >
          {images.map((src, i) => (
            <div key={i} className="relative h-full" style={{ width: `${100 / images.length}%` }}>
              <Image
                src={src || PLACEHOLDER}
                alt={`${nombre} — imagen ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain p-4 transition-all duration-200 ${sinStock ? "opacity-40 grayscale" : ""}`}
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
              />
            </div>
          ))}
        </div>

        {/* Arrows — siempre visibles en el modal */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={18} className="text-brand" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={18} className="text-brand" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current ? "w-4 h-2 bg-brand" : "w-2 h-2 bg-brand/30 hover:bg-brand/50"
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {hasMultiple && (
        <span className="absolute top-2 right-2 text-xs font-medium bg-black/40 text-white px-2 py-0.5 rounded-full pointer-events-none">
          {current + 1}/{images.length}
        </span>
      )}
    </div>
  );
}

export function ProductModal({ product, isAuthenticated, onClose }: Props) {
  const dispatch    = useDispatch();
  const cartItem    = useSelector((s: RootState) => s.cart.items.find((i) => i.codigo === product.codigo));
  const firstImage  = product.imagenes?.[0]?.foto_1 ?? PLACEHOLDER;
  const precio      = product.neto ?? product.precio_final;
  const sinStock    = product.stock <= 0;

  // Cerrar con Escape y bloquear scroll
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function add() {
    if (!isAuthenticated || sinStock) return;
    dispatch(addToCart({ codigo: product.codigo, nombre: product.nombre, precio, cantidad: 1, image: firstImage }));
  }

  function remove() { dispatch(removeFromCart(product.codigo)); }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-brand-light w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-brand/10 hover:bg-brand/20 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <X size={16} className="text-brand" />
        </button>

        <div className="grid sm:grid-cols-2 gap-0">
          {/* Imagen */}
          <div className="p-4 pb-2 sm:pb-4">
            <ModalCarousel imagenes={product.imagenes} nombre={product.nombre} sinStock={sinStock} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 p-4 pt-2 sm:pt-4">
            {/* Código + stock */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand/15 text-brand uppercase tracking-wider">
                {product.codigo}
              </span>
              <StockBadge stock={product.stock} />
            </div>

            {/* Nombre completo */}
            <h2 className="text-base font-semibold text-brand-dark leading-snug">
              {capitalizar(product.nombre)}
            </h2>

            {/* Observaciones */}
            {product.observ && (
              <p className="text-sm text-brand-dark/80 leading-relaxed">{product.observ}</p>
            )}

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 mt-auto pt-2">
                <p className="text-2xl font-bold text-brand">
                  ${precio?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-brand-dark/70 leading-tight">
                  Los precios no incluyen IVA
                </p>

                {cartItem ? (
                  <div className="flex items-center justify-between rounded-lg border border-brand/30 overflow-hidden mt-1">
                    <button type="button" onClick={remove} className="flex-1 flex items-center justify-center py-2.5 text-brand hover:bg-brand/10 transition-colors" aria-label="Quitar uno">
                      <Minus size={16} />
                    </button>
                    <span className="px-4 text-sm font-semibold text-brand-dark">{cartItem.cantidad}</span>
                    <button type="button" onClick={add} disabled={sinStock} className="flex-1 flex items-center justify-center py-2.5 text-brand hover:bg-brand/10 transition-colors disabled:opacity-40" aria-label="Agregar uno más">
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={add}
                    disabled={sinStock}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors mt-1"
                  >
                    <ShoppingCart size={16} />
                    Agregar al carrito
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-brand-dark/70 italic mt-auto pt-2">
                Iniciá sesión para ver el precio
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
