"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import type { Product } from "@/types";
import { ProductModal } from "@/components/product/ProductModal";
import { capitalizar } from "@/lib/format";

const PLACEHOLDER = "/images/logo.png";

interface Props {
  product:         Product;
  isAuthenticated: boolean;
}

/* ── Stock badge ─────────────────────────────────────────────────── */
function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shrink-0">
        Sin stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-white shrink-0">
        Últimas {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-dark text-white shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
      En stock
    </span>
  );
}

/* ── Safe image with fallback ────────────────────────────────────── */
function SafeImage({ src, alt, width, className }: { src: string; alt: string; width: string; className: string }) {
  const [error, setError] = useState(false);
  return (
    <div className="relative h-full" style={{ width }}>
      {error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={PLACEHOLDER}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain p-4"
        />
      ) : (
        <Image
          src={src || PLACEHOLDER}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className={className}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

/* ── Image carousel ──────────────────────────────────────────────── */
interface CarouselProps {
  imagenes: Product["imagenes"];
  nombre:   string;
  sinStock: boolean;
}

function ImageCarousel({ imagenes, nombre, sinStock }: CarouselProps) {
  const images = imagenes?.length > 0
    ? imagenes.map((i) => i.foto_1).filter(Boolean)
    : [PLACEHOLDER];

  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const hasMultiple = images.length > 1;

  function goPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }

  function goNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrent((c) => (c + 1) % images.length);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      setCurrent((c) =>
        diff > 0
          ? (c + 1) % images.length
          : (c - 1 + images.length) % images.length
      );
    }
  }

  return (
    <div
      className="relative aspect-square overflow-hidden bg-gray-50 select-none"
      onTouchStart={hasMultiple ? onTouchStart : undefined}
      onTouchEnd={hasMultiple ? onTouchEnd : undefined}
    >
      {/* Sliding track */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{
          width:     `${images.length * 100}%`,
          transform: `translateX(-${current * (100 / images.length)}%)`,
        }}
      >
        {images.map((src, i) => (
          <SafeImage
            key={i}
            src={src}
            alt={`${nombre} — imagen ${i + 1}`}
            width={`${100 / images.length}%`}
            className={`object-contain p-2 transition-all duration-200 ${sinStock ? "opacity-40 grayscale" : ""}`}
          />
        ))}
      </div>

      {/* Arrow buttons — visible on group-hover (desktop) */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/85 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={13} className="text-brand" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/85 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={13} className="text-brand" />
          </button>
        </>
      )}

      {/* Counter badge top-right */}
      {hasMultiple && (
        <span className="absolute top-1.5 right-1.5 z-20 text-[9px] font-medium bg-black/40 text-white px-1.5 py-0.5 rounded-full pointer-events-none">
          {current + 1}/{images.length}
        </span>
      )}

      {/* Dot indicators bottom-center */}
      {hasMultiple && (
        <div className="absolute bottom-1.5 left-0 right-0 flex items-center justify-center gap-1 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? "w-3 h-1.5 bg-brand"
                  : "w-1.5 h-1.5 bg-brand/30 hover:bg-brand/50"
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Product card ────────────────────────────────────────────────── */
export function ProductCard({ product, isAuthenticated }: Props) {
  const dispatch    = useDispatch();
  const cartItemRaw = useSelector((s: RootState) =>
    s.cart.items.find((i) => i.codigo === product.codigo)
  );
  const [mounted,   setMounted]   = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartItem = mounted ? cartItemRaw : undefined;

  const firstImage = product.imagenes?.[0]?.foto_1 ?? PLACEHOLDER;
  const precio     = product.neto ?? product.precio_final;
  const sinStock   = product.stock <= 0;
  const atMax      = !!cartItem && cartItem.cantidad >= product.stock;

  function add(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated || sinStock) return;
    if (cartItem && cartItem.cantidad >= product.stock) return;
    dispatch(addToCart({
      codigo:   product.codigo,
      nombre:   product.nombre,
      precio:   precio,
      cantidad: 1,
      image:    firstImage,
      stock:    product.stock,
    }));
  }

  function remove(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch(removeFromCart(product.codigo));
  }

  return (
    <>
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-card-hover transition-shadow bg-white cursor-pointer"
      onClick={() => setModalOpen(true)}
    >

      <ImageCarousel
        imagenes={product.imagenes}
        nombre={product.nombre}
        sinStock={sinStock}
      />

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">

        {/* Code + stock */}
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span className="inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wider truncate">
            {product.codigo}
          </span>
          <StockBadge stock={product.stock} />
        </div>

        {/* Name */}
        <p className="text-sm font-medium text-gray-800 leading-snug flex-1">
          {capitalizar(product.nombre)}
        </p>

        {isAuthenticated ? (
          <>
            <p className="text-lg font-bold text-brand-darker">
              ${precio?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400 leading-tight">
              Los precios no incluyen IVA
            </p>

            {cartItem ? (
              <>
                <div className="flex items-center justify-between rounded-lg border border-brand/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={remove}
                    className="flex-1 flex items-center justify-center py-2 text-brand hover:bg-brand-light transition-colors"
                    aria-label="Quitar uno"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-3 text-sm font-semibold text-brand-dark">
                    {cartItem.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => add(e)}
                    disabled={sinStock || atMax}
                    title={atMax ? "Stock máximo alcanzado" : undefined}
                    className="flex-1 flex items-center justify-center py-2 text-brand hover:bg-brand-light transition-colors disabled:opacity-40"
                    aria-label="Agregar uno más"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                {atMax && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center font-medium -mt-1">
                    Stock máximo alcanzado
                  </p>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => add(e)}
                disabled={sinStock}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-dark hover:bg-brand-darker disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                <ShoppingCart size={15} />
                Agregar
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-brand-dark/70 italic">
            Iniciá sesión para ver el precio
          </p>
        )}
      </div>
    </article>

    {modalOpen && (
      <ProductModal
        product={product}
        isAuthenticated={isAuthenticated}
        onClose={() => setModalOpen(false)}
      />
    )}
    </>
  );
}
