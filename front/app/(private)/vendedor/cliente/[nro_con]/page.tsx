"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ShoppingBag, ShoppingCart, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";

interface ItemDetalle {
  codart: string; nombre: string; cantid: number; precio: number; subtotal: number;
}

function PedidoExpandible({
  compro, fecha, total, estadoPago, token, apiUrl,
}: {
  compro: string; fecha: string | null; total: number;
  estadoPago: "aprobado" | "pendiente" | null;
  token: string | null; apiUrl: string;
}) {
  const [open,    setOpen]    = useState(false);
  const [items,   setItems]   = useState<ItemDetalle[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!open && items === null) {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/vendedor/pedido/${compro}/detalle/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.ok ? await res.json() : []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    }
    setOpen((v) => !v);
  }

  return (
    <div className="bg-white rounded-xl border border-brand/10 shadow-sm overflow-hidden">
      <button onClick={toggle} className="w-full px-4 py-3 text-left flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-brand-dark">#{compro}</span>
            <span className="text-sm text-brand-dark/60">{fecha ?? "—"}</span>
            <span className="text-sm font-medium text-brand-dark ml-auto">{fmt$(total)}</span>
            <BadgePago estado={estadoPago} />
          </div>
        </div>
        <ChevronDown size={16} className={`shrink-0 text-brand/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-brand/10 bg-brand-light/20 px-4 py-3">
          {loading ? (
            <p className="text-xs text-brand-dark/40">Cargando...</p>
          ) : items && items.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-brand-dark/40 uppercase tracking-wide">
                  <th className="text-left pb-1.5 font-semibold">Producto</th>
                  <th className="text-right pb-1.5 font-semibold">Cant.</th>
                  <th className="text-right pb-1.5 font-semibold">Precio</th>
                  <th className="text-right pb-1.5 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.codart} className="border-t border-brand/5">
                    <td className="py-1.5 pr-2">
                      <span className="font-medium text-brand-dark">{item.nombre}</span>
                      <span className="text-brand-dark/40 ml-1.5">{item.codart}</span>
                    </td>
                    <td className="py-1.5 text-right text-brand-dark/60">{item.cantid}</td>
                    <td className="py-1.5 text-right text-brand-dark/60">{fmt$(item.precio)}</td>
                    <td className="py-1.5 text-right font-semibold text-brand-dark">{fmt$(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-brand/10">
                  <td colSpan={3} className="pt-2 text-right font-semibold text-brand-dark/70">Total</td>
                  <td className="pt-2 text-right font-bold text-brand">
                    {fmt$(items.reduce((s, i) => s + i.subtotal, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-xs text-brand-dark/40">Sin ítems registrados.</p>
          )}
        </div>
      )}
    </div>
  );
}

interface ClienteDetalle {
  cliente: { nombre: string; cuit: string; login: string };
  pedidos: {
    compro: string; fecha: string | null; total: number;
    estado_pago: "aprobado" | "pendiente" | null;
  }[];
  carrito: {
    codart: string; cantid: number; precio: number;
    nombre: string; subtotal: number;
  }[];
}

function fmt$(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function BadgePago({ estado }: { estado: "aprobado" | "pendiente" | null }) {
  if (!estado) return null;
  if (estado === "aprobado")
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Pagado online</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pago pendiente</span>;
}

export default function ClienteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const nro_con = params.nro_con as string;

  const { user, isAuthenticated, authChecked, token } = useAuth();
  const [data,    setData]    = useState<ClienteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (authChecked && (!isAuthenticated || user?.catusu !== "V")) {
      router.replace("/catalogo");
    }
  }, [authChecked, isAuthenticated, user, router]);

  useEffect(() => {
    if (!authChecked || !isAuthenticated || user?.catusu !== "V") return;
    const tkn = token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendedor/cliente/${nro_con}/`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError("No se pudo cargar la información del cliente."))
      .finally(() => setLoading(false));
  }, [authChecked, isAuthenticated, user, token, nro_con]);

  if (!authChecked || !isAuthenticated || user?.catusu !== "V") return null;

  const totalCarrito = data?.carrito.reduce((s, i) => s + i.subtotal, 0) ?? 0;

  return (
    <div className="min-h-screen bg-brand-light/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-brand-dark/60 hover:text-brand mb-5 transition-colors">
          <ArrowLeft size={16} /> Volver
        </button>

        {loading && <p className="text-sm text-brand-dark/50">Cargando...</p>}
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

        {data && (
          <>
            {/* Cliente header */}
            <div className="bg-white rounded-2xl border border-brand/10 shadow-sm p-5 mb-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center shrink-0">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand">{data.cliente.nombre || `Cliente ${nro_con}`}</h1>
                <div className="text-xs text-brand-dark/50 space-x-3 mt-1">
                  <span>N° {nro_con}</span>
                  {data.cliente.cuit  && <span>CUIT: {data.cliente.cuit}</span>}
                  {data.cliente.login && <span>Login: {data.cliente.login}</span>}
                </div>
              </div>
            </div>

            {/* Carrito activo */}
            <section className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={16} className="text-brand/70" />
                <h2 className="text-sm font-semibold text-brand-dark uppercase tracking-widest">
                  Carrito actual
                </h2>
              </div>

              {data.carrito.length === 0 ? (
                <p className="text-sm text-brand-dark/40 italic">Carrito vacío.</p>
              ) : (
                <div className="bg-white rounded-2xl border border-brand/10 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand/10">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-brand-dark/50 uppercase">Producto</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-brand-dark/50 uppercase">Cant.</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-brand-dark/50 uppercase">Precio</th>
                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-brand-dark/50 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.carrito.map((item) => (
                        <tr key={item.codart} className="border-b border-brand/5 last:border-0">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-brand-dark">{item.nombre}</p>
                            <p className="text-xs text-brand-dark/40">{item.codart}</p>
                          </td>
                          <td className="px-4 py-2.5 text-right text-brand-dark/70">{item.cantid}</td>
                          <td className="px-4 py-2.5 text-right text-brand-dark/70">{fmt$(item.precio)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-brand-dark">{fmt$(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-brand/10 bg-brand-light/30">
                        <td colSpan={3} className="px-4 py-2.5 text-sm font-semibold text-brand-dark text-right">Total estimado</td>
                        <td className="px-4 py-2.5 text-right font-bold text-brand">{fmt$(totalCarrito)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>

            {/* Pedidos web */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag size={16} className="text-brand/70" />
                <h2 className="text-sm font-semibold text-brand-dark uppercase tracking-widest">
                  Pedidos web ({data.pedidos.length})
                </h2>
              </div>

              {data.pedidos.length === 0 ? (
                <p className="text-sm text-brand-dark/40 italic">Sin pedidos web registrados.</p>
              ) : (
                <div className="space-y-2">
                  {data.pedidos.map((p) => (
                    <PedidoExpandible
                      key={p.compro}
                      compro={p.compro}
                      fecha={p.fecha}
                      total={p.total}
                      estadoPago={p.estado_pago}
                      token={token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null)}
                      apiUrl={process.env.NEXT_PUBLIC_API_URL ?? ""}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
