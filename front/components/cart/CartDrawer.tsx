"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { clearCart, removeFromCart, setQuantity } from "@/redux/slices/cartSlice";
import { Drawer } from "@/components/ui/Drawer";
import { CartItem } from "@/components/cart/CartItem";
import { StockResolutionModal } from "@/components/cart/StockResolutionModal";
import type { SinStockItem } from "@/components/cart/StockResolutionModal";
import { Button } from "@/components/ui/Button";
import { useCreatePedido } from "@/app/lib/hooks/usePedidos";
import { useAuth } from "@/app/lib/hooks/useAuth";

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const items    = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch();
  const { token: authToken } = useAuth();
  const { mutateAsync: crearPedido, isPending } = useCreatePedido();

  const [observ,   setObserv]   = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [sinStock, setSinStock] = useState<SinStockItem[]>([]);

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  async function handleConfirm() {
    if (!items.length) return;
    setFeedback(null);
    setSinStock([]);
    try {
      await crearPedido({
        observ: observ.trim() || "Sin observaciones",
        detalle: items.map((i) => ({ codigo: i.codigo, cantidad: i.cantidad, precio: i.precio })),
      });
      dispatch(clearCart());
      if (authToken) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/carrito/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }).catch(() => {});
      }
      setObserv("");
      setFeedback({ ok: true, msg: "¡Pedido confirmado con éxito!" });
    } catch (err: unknown) {
      const data = (err as { data?: { tipo?: string; items?: { codigo: string; disponible: number }[] } })?.data;
      if (data?.tipo === "stock_insuficiente" && Array.isArray(data.items) && data.items.length > 0) {
        // Normalizar códigos para evitar fallos por espacios en códigos del ERP
        const stockMap = Object.fromEntries(data.items.map((i) => [i.codigo.trim(), i.disponible]));
        const matched = items
          .filter((i) => i.codigo.trim() in stockMap)
          .map((i) => ({ codigo: i.codigo, nombre: i.nombre, disponible: stockMap[i.codigo.trim()], solicitado: i.cantidad }));
        if (matched.length > 0) {
          setSinStock(matched);
        } else {
          // El código del backend no coincide con ningún ítem del carrito — fallback genérico
          setFeedback({ ok: false, msg: "Algunos artículos no tienen stock suficiente. Revisá tu carrito." });
        }
      } else {
        setFeedback({ ok: false, msg: "No se pudo enviar el pedido. Intentá de nuevo." });
      }
    }
  }

  function resolveItem(codigo: string, disponible: number) {
    if (disponible > 0) {
      dispatch(setQuantity({ codigo, cantidad: disponible }));
    } else {
      dispatch(removeFromCart({ codigo, removeCompletely: true }));
    }
    setSinStock((prev) => prev.filter((i) => i.codigo !== codigo));
  }

  function handleAdjust(codigo: string) {
    const item = sinStock.find((i) => i.codigo === codigo);
    if (item) resolveItem(codigo, item.disponible);
  }

  function handleRemove(codigo: string) {
    resolveItem(codigo, 0);
  }

  function handleResolveAll() {
    sinStock.forEach(({ codigo, disponible }) => resolveItem(codigo, disponible));
  }

  return (
    <>
      <Drawer open={open} onClose={onClose} title="Mi carrito" width="w-full sm:w-[440px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-stone-400">
            <ShoppingBag size={40} strokeWidth={1.5} />
            <p className="text-sm">Tu carrito está vacío</p>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Ver catálogo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 divide-y divide-stone-100 dark:divide-stone-800">
              {items.map((item) => <CartItem key={item.codigo} item={item} />)}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <textarea
                rows={2}
                placeholder="Observaciones del pedido (opcional)"
                value={observ}
                onChange={(e) => setObserv(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-brand/20 bg-white text-brand-darker placeholder-brand/60 resize-none focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
              />

              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-stone-600 dark:text-stone-400">Total estimado</span>
                <span className="text-xl text-amber-600 dark:text-amber-500">
                  ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {feedback && (
                <p className={`text-sm text-center font-medium ${feedback.ok ? "text-emerald-600" : "text-red-500"}`}>
                  {feedback.msg}
                </p>
              )}

              {process.env.NODE_ENV === "development" && items.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const first = items[0];
                      dispatch(setQuantity({ codigo: first.codigo, cantidad: first.stock ?? first.cantidad }));
                    }}
                    className="flex-1 text-[10px] text-stone-300 hover:text-stone-500 text-center py-1 transition-colors"
                  >
                    🧪 test máx badge
                  </button>
                  <button
                    type="button"
                    onClick={() => setSinStock(
                      items.slice(0, 3).map((item, i) => ({
                        codigo:     item.codigo,
                        nombre:     item.nombre,
                        disponible: i === 1 ? 0 : Math.max(0, item.cantidad - 1),
                        solicitado: item.cantidad,
                      }))
                    )}
                    className="flex-1 text-[10px] text-stone-300 hover:text-stone-500 text-center py-1 transition-colors"
                  >
                    🧪 test stock modal
                  </button>
                </div>
              )}

              <Button fullWidth loading={isPending} onClick={handleConfirm}>
                Confirmar pedido
              </Button>

              <Link
                href="/pedidos"
                onClick={onClose}
                className="flex items-center justify-center gap-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              >
                Ver mis pedidos anteriores <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </Drawer>

      {sinStock.length > 0 && (
        <StockResolutionModal
          items={sinStock}
          onAdjust={handleAdjust}
          onRemove={handleRemove}
          onResolveAll={handleResolveAll}
          onClose={() => setSinStock([])}
        />
      )}
    </>
  );
}
