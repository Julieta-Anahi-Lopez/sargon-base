"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { usePedidos } from "@/app/lib/hooks/usePedidos";
import type { Pedido } from "@/types";
import { ChevronDown, Package, ShoppingBag } from "lucide-react";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });
  } catch {
    return iso;
  }
}

function PedidoCard({ pedido }: { pedido: Pedido }) {
  const [open, setOpen] = useState(false);

  const total = pedido.detalles.reduce((acc, d) => acc + d.precio * d.cantid, 0);

  return (
    <div className="bg-white rounded-xl border border-brand/20 overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Package size={18} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-dark">
              Pedido #{pedido.compro}
            </p>
            <p className="text-xs text-brand-dark/60 mt-0.5">
              {formatDate(pedido.fecped)}
              {pedido.observ && pedido.observ !== "Sin observaciones" && (
                <> · {pedido.observ}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm font-bold text-brand hidden sm:block">
            ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
          <ChevronDown
            size={16}
            className={`text-brand/40 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expandable detail */}
      {open && (
        <div className="border-t border-brand/10 px-5 py-4">
          <div className="sm:hidden mb-3">
            <span className="text-xs text-brand-dark/70">Total estimado: </span>
            <span className="text-sm font-bold text-brand">
              ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="text-brand-dark/70 uppercase tracking-wider">
                <th className="text-left pb-2 font-medium">Producto</th>
                <th className="text-right pb-2 font-medium">Cant.</th>
                <th className="text-right pb-2 font-medium hidden sm:table-cell">Precio</th>
                <th className="text-right pb-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand/10">
              {pedido.detalles.map((d) => (
                <tr key={`${d.compro}-${d.nroord}`}>
                  <td className="py-2 pr-4 text-brand-dark font-medium">
                    {d.descri}
                    <span className="block text-brand-dark/50 font-normal">{d.codart}</span>
                  </td>
                  <td className="py-2 text-right text-brand-dark/70">{d.cantid}</td>
                  <td className="py-2 text-right text-brand-dark/70 hidden sm:table-cell">
                    ${d.precio.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 text-right font-semibold text-brand-dark">
                    ${(d.precio * d.cantid).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PedidosPage() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { data: pedidos = [], isLoading } = usePedidos(isAuthenticated);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand mb-6">Mis pedidos</h1>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-brand/20 animate-pulse" />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-brand-dark/50 gap-4">
            <ShoppingBag size={40} strokeWidth={1.5} />
            <p className="text-sm">Todavía no realizaste ningún pedido.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((p) => (
              <PedidoCard key={p.compro} pedido={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
