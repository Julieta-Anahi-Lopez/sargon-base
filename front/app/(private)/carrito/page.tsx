"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { addToCart, removeFromCart, clearCart } from "@/redux/slices/cartSlice";
import { useCreatePedido } from "@/app/lib/hooks/usePedidos";
import { Button } from "@/components/ui/Button";
import { capitalizar } from "@/lib/format";

export default function CarritoPage() {
  const items    = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch();
  const { mutateAsync: crearPedido, isPending } = useCreatePedido();

  const [observ,   setObserv]   = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  async function handleConfirm() {
    if (!items.length) return;
    setFeedback(null);
    try {
      await crearPedido({
        observ:  observ.trim() || "Sin observaciones",
        detalle: items.map((i) => ({ codigo: i.codigo, cantidad: i.cantidad, precio: i.precio })),
      });
      dispatch(clearCart());
      setObserv("");
      setFeedback({ ok: true, msg: "¡Pedido confirmado con éxito!" });
    } catch (err: unknown) {
      const data = (err as { data?: { tipo?: string } })?.data;
      const msg =
        data?.tipo === "stock_insuficiente"
          ? "Algunos artículos no tienen stock suficiente."
          : "No se pudo enviar el pedido. Intentá de nuevo.";
      setFeedback({ ok: false, msg });
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-xs text-brand/60 hover:text-brand mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Volver al catálogo
        </Link>

        <h1 className="text-2xl font-bold text-brand mb-6">Mi carrito</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-brand-dark/50">
            <ShoppingBag size={40} strokeWidth={1.5} />
            <p className="text-sm">Tu carrito está vacío.</p>
            <Link href="/catalogo">
              <Button variant="secondary" size="sm">Ver catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Items */}
            <div className="bg-white rounded-xl border border-brand/20 divide-y divide-brand/10">
              {items.map((item) => (
                <div key={item.codigo} className="flex gap-4 px-5 py-4">
                  {/* Image */}
                  <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-brand/10">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.nombre}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-dark line-clamp-2 leading-snug">
                      {capitalizar(item.nombre)}
                    </p>
                    <p className="text-xs text-brand-dark/60 mt-0.5">
                      ${item.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })} c/u
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center rounded-md border border-brand/25 overflow-hidden">
                        <button
                          onClick={() => dispatch(removeFromCart(item.codigo))}
                          className="w-8 h-8 flex items-center justify-center text-brand/60 hover:bg-brand/10 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-medium text-brand-dark">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => dispatch(addToCart({ ...item, cantidad: 1 }))}
                          className="w-8 h-8 flex items-center justify-center text-brand/60 hover:bg-brand/10 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart({ codigo: item.codigo, removeCompletely: true }))}
                        className="ml-auto p-1.5 text-brand/40 hover:text-red-500 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <p className="text-sm font-semibold text-brand shrink-0 pt-0.5">
                    ${(item.precio * item.cantidad).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary & confirm */}
            <div className="bg-white rounded-xl border border-brand/20 p-5 space-y-4">
              <textarea
                rows={3}
                placeholder="Observaciones del pedido (opcional)"
                value={observ}
                onChange={(e) => setObserv(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-brand/20 bg-white text-brand-darker placeholder-brand/60 resize-none focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
              />

              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-dark/80 font-medium">Total estimado</span>
                <span className="text-2xl font-bold text-brand">
                  ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {feedback && (
                <p className={`text-sm text-center font-medium ${feedback.ok ? "text-emerald-600" : "text-red-500"}`}>
                  {feedback.msg}
                </p>
              )}

              <Button fullWidth loading={isPending} onClick={handleConfirm}>
                Confirmar pedido
              </Button>

              <Link
                href="/pedidos"
                className="flex items-center justify-center gap-1 text-xs text-brand-dark/60 hover:text-brand transition-colors"
              >
                Ver mis pedidos anteriores
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
