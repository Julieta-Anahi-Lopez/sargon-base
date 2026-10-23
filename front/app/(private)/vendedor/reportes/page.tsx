"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, UserX,
  TrendingUp, RefreshCw, ChevronRight, Package, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";

// ─── types ──────────────────────────────────────────────────────────────────

interface Dashboard {
  hoy:   { pedidos: number };
  semana: { pedidos: number; monto: number };
  mes:    { pedidos: number; monto: number };
  pagos_mes: { aprobados: number; monto_cobrado: number; pendientes: number };
  carritos_activos: number;
  clientes_inactivos_30d: number;
}

interface PedidoWeb {
  compro: string; nro_cli: number; cliente: string;
  fecha: string | null; total: number;
  estado_pago: "aprobado" | "pendiente" | null;
  monto_mp: number | null; erp_comprobante_id: number | null;
}

interface Carrito {
  nro_cli: number; cliente: string; items: number;
  monto_estimado: number; resumen: string;
}

interface ClienteInactivo {
  nro_cli: number; cliente: string;
  ultimo_pedido: string | null; dias_sin_pedido: number | null;
}

interface ProductoRanking {
  codart: string; nombre: string;
  total_unidades: number; total_pedidos: number; monto_total: number;
}

type Tab = "dashboard" | "pedidos" | "carritos" | "inactivos" | "ranking";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt$(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(s: string | null) {
  return s ?? "—";
}

function BadgePago({ estado }: { estado: "aprobado" | "pendiente" | null }) {
  if (!estado) return null;
  if (estado === "aprobado")
    return <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Pagado online</span>;
  return <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pago pendiente</span>;
}

// ─── Pedido row expandible ──────────────────────────────────────────────────

interface ItemDetalle {
  codart: string; nombre: string; cantid: number; precio: number; subtotal: number;
}

function PedidoRow({
  compro, cliente, nroCli, fecha, total, estadoPago, onVerCliente, getToken, apiUrl,
}: {
  compro: string; cliente: string; nroCli: number; fecha: string | null;
  total: number; estadoPago: "aprobado" | "pendiente" | null;
  onVerCliente: () => void; getToken: () => string | null; apiUrl: string;
}) {
  const [open,    setOpen]    = useState(false);
  const [items,   setItems]   = useState<ItemDetalle[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!open && items === null) {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/vendedor/pedido/${compro}/detalle/`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setItems(res.ok ? await res.json() : []);
      } catch { setItems([]); }
      finally { setLoading(false); }
    }
    setOpen((v) => !v);
  }

  const totalItems = items?.reduce((s, i) => s + i.subtotal, 0) ?? 0;

  return (
    <div className="bg-white rounded-xl border border-brand/10 shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={toggle} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-brand-dark">#{compro}</span>
            <span className="text-sm text-brand-dark/70 truncate">{cliente || `Cliente ${nroCli}`}</span>
            <BadgePago estado={estadoPago} />
          </div>
          <p className="text-xs text-brand-dark/50 mt-0.5">{fmtDate(fecha)} · {fmt$(total)}</p>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onVerCliente} className="p-1.5 text-brand/40 hover:text-brand transition-colors" title="Ver cliente">
            <ChevronRight size={16} />
          </button>
          <button onClick={toggle} className={`p-1.5 text-brand/40 hover:text-brand transition-colors transition-transform ${open ? "rotate-180" : ""}`} title="Ver detalle">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

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
                  <td className="pt-2 text-right font-bold text-brand">{fmt$(totalItems)}</td>
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

// ─── KPI card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, onClick }: { label: string; value: string | number; sub?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border shadow-sm p-5 transition-colors ${
        onClick
          ? "border-brand/10 cursor-pointer hover:border-brand/40 hover:bg-brand-light/30"
          : "border-brand/10"
      }`}
    >
      <p className="text-xs text-brand-dark/60 font-medium uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-brand leading-none">{value}</p>
      {sub && <p className="text-xs text-brand-dark/50 mt-1">{sub}</p>}
      {onClick && <p className="text-xs text-brand/50 mt-2 font-medium">Ver detalle →</p>}
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

export default function ReportesPage() {
  const router = useRouter();
  const { user, isAuthenticated, authChecked, token } = useAuth();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dashboard, setDashboard]   = useState<Dashboard | null>(null);
  const [pedidos,   setPedidos]     = useState<PedidoWeb[]>([]);
  const [carritos,  setCarritos]    = useState<Carrito[]>([]);
  const [inactivos, setInactivos]   = useState<ClienteInactivo[]>([]);
  const [ranking,   setRanking]     = useState<ProductoRanking[]>([]);

  const [filtroFechaDesde, setFiltroFechaDesde] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [filtroFechaHasta, setFiltroFechaHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [filtroCliente,    setFiltroCliente]    = useState("");
  const [diasInactivos,    setDiasInactivos]    = useState(30);
  const [diasRanking,      setDiasRanking]      = useState(30);

  useEffect(() => {
    if (authChecked && (!isAuthenticated || user?.catusu !== "V")) {
      router.replace("/catalogo");
    }
  }, [authChecked, isAuthenticated, user, router]);

  function getToken() {
    return token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
  }

  const apiFetch = useCallback(async (path: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadDashboard = useCallback(async () => {
    setLoading(true); setError("");
    try { setDashboard(await apiFetch("/vendedor/dashboard/")); }
    catch { setError("No se pudo cargar el dashboard."); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const loadPedidos = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ desde: filtroFechaDesde, hasta: filtroFechaHasta });
      if (filtroCliente.trim()) params.set("nro_cli", filtroCliente.trim());
      setPedidos(await apiFetch(`/vendedor/pedidos-web/?${params}`));
    } catch { setError("No se pudieron cargar los pedidos."); }
    finally { setLoading(false); }
  }, [apiFetch, filtroFechaDesde, filtroFechaHasta, filtroCliente]);

  const loadCarritos = useCallback(async () => {
    setLoading(true); setError("");
    try { setCarritos(await apiFetch("/vendedor/carritos/")); }
    catch { setError("No se pudieron cargar los carritos."); }
    finally { setLoading(false); }
  }, [apiFetch]);

  const loadInactivos = useCallback(async () => {
    setLoading(true); setError("");
    try { setInactivos(await apiFetch(`/vendedor/clientes-inactivos/?dias=${diasInactivos}`)); }
    catch { setError("No se pudieron cargar los clientes inactivos."); }
    finally { setLoading(false); }
  }, [apiFetch, diasInactivos]);

  const loadRanking = useCallback(async () => {
    setLoading(true); setError("");
    try { setRanking(await apiFetch(`/vendedor/productos-ranking/?dias=${diasRanking}`)); }
    catch { setError("No se pudo cargar el ranking."); }
    finally { setLoading(false); }
  }, [apiFetch, diasRanking]);

  useEffect(() => {
    if (!authChecked || !isAuthenticated || user?.catusu !== "V") return;
    if (tab === "dashboard")  loadDashboard();
    if (tab === "pedidos")    loadPedidos();
    if (tab === "carritos")   loadCarritos();
    if (tab === "inactivos")  loadInactivos();
    if (tab === "ranking")    loadRanking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, authChecked, isAuthenticated, user]);

  if (!authChecked || !isAuthenticated || user?.catusu !== "V") return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Resumen",  icon: <LayoutDashboard size={16} /> },
    { id: "pedidos",   label: "Pedidos",  icon: <ShoppingBag size={16} /> },
    { id: "carritos",  label: "Carritos", icon: <ShoppingCart size={16} /> },
    { id: "inactivos", label: "Inactivos",icon: <UserX size={16} /> },
    { id: "ranking",   label: "Ranking",  icon: <TrendingUp size={16} /> },
  ];

  const inputCls = "px-3 py-2 rounded-lg border border-brand/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition";
  const btnCls   = "flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium transition-colors";

  return (
    <div className="min-h-screen bg-brand-light/30 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand">Módulo Vendedor</h1>
          <p className="text-sm text-brand-dark/60 mt-0.5">Actividad web de tus clientes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-brand-dark/70 border border-brand/10 hover:bg-brand-light/60"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-brand-dark/50 font-medium uppercase tracking-widest">Resumen de actividad</p>
              <button onClick={loadDashboard} disabled={loading} className={btnCls}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
              </button>
            </div>
            {loading && !dashboard ? (
              <p className="text-sm text-brand-dark/50">Cargando...</p>
            ) : dashboard ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <KpiCard label="Pedidos hoy"   value={dashboard.hoy.pedidos} onClick={() => setTab("pedidos")} />
                  <KpiCard label="Pedidos semana" value={dashboard.semana.pedidos} sub={fmt$(dashboard.semana.monto)} onClick={() => setTab("pedidos")} />
                  <KpiCard label="Pedidos mes"    value={dashboard.mes.pedidos}    sub={fmt$(dashboard.mes.monto)} onClick={() => setTab("pedidos")} />
                  <KpiCard label="Cobrado online (mes)" value={fmt$(dashboard.pagos_mes.monto_cobrado)} sub={`${dashboard.pagos_mes.aprobados} pagos aprobados`} onClick={() => setTab("pedidos")} />
                  <KpiCard label="Pagos pendientes" value={dashboard.pagos_mes.pendientes} onClick={() => setTab("pedidos")} />
                  <KpiCard label="Carritos activos" value={dashboard.carritos_activos} onClick={() => setTab("carritos")} />
                  <KpiCard label="Clientes sin pedidos (30d)" value={dashboard.clientes_inactivos_30d} onClick={() => setTab("inactivos")} />
                </div>
              </>
            ) : null}
          </>
        )}

        {/* ── PEDIDOS WEB ── */}
        {tab === "pedidos" && (
          <>
            <div className="bg-white rounded-2xl border border-brand/10 shadow-sm p-4 mb-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-brand-dark/70 mb-1">Desde</label>
                  <input type="date" value={filtroFechaDesde} onChange={(e) => setFiltroFechaDesde(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-dark/70 mb-1">Hasta</label>
                  <input type="date" value={filtroFechaHasta} onChange={(e) => setFiltroFechaHasta(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-dark/70 mb-1">N° cliente</label>
                  <input type="text" value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} placeholder="Todos" className={`${inputCls} w-28`} />
                </div>
                <button onClick={loadPedidos} disabled={loading} className={btnCls}>
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Buscar
                </button>
              </div>
            </div>

            {loading && pedidos.length === 0 ? (
              <p className="text-sm text-brand-dark/50">Cargando...</p>
            ) : pedidos.length === 0 ? (
              <p className="text-sm text-brand-dark/50">No hay pedidos en el período seleccionado.</p>
            ) : (
              <div className="space-y-2">
                {pedidos.map((p) => (
                  <PedidoRow
                    key={p.compro}
                    compro={p.compro}
                    cliente={p.cliente}
                    nroCli={p.nro_cli}
                    fecha={p.fecha}
                    total={p.total}
                    estadoPago={p.estado_pago}
                    onVerCliente={() => router.push(`/vendedor/cliente/${p.nro_cli}`)}
                    getToken={getToken}
                    apiUrl={process.env.NEXT_PUBLIC_API_URL ?? ""}
                  />
                ))}
                <p className="text-xs text-brand-dark/40 text-right pt-1">{pedidos.length} resultado{pedidos.length !== 1 ? "s" : ""}</p>
              </div>
            )}
          </>
        )}

        {/* ── CARRITOS ACTIVOS ── */}
        {tab === "carritos" && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-brand-dark/50 font-medium uppercase tracking-widest">Carritos con ítems ahora</p>
              <button onClick={loadCarritos} disabled={loading} className={btnCls}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
              </button>
            </div>

            {loading && carritos.length === 0 ? (
              <p className="text-sm text-brand-dark/50">Cargando...</p>
            ) : carritos.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={36} className="mx-auto text-brand/20 mb-3" />
                <p className="text-sm text-brand-dark/40">Ningún cliente tiene ítems en el carrito en este momento.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {carritos.map((c) => (
                  <div key={c.nro_cli} className="bg-white rounded-xl border border-brand/10 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-brand-dark">{c.cliente || `Cliente ${c.nro_cli}`}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-light text-brand font-medium">
                          {c.items} ítem{c.items !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-xs text-brand-dark/50 mt-0.5">Estimado: {fmt$(c.monto_estimado)}</p>
                      {c.resumen && <p className="text-xs text-brand-dark/40 mt-0.5 truncate">{c.resumen}</p>}
                    </div>
                    <button
                      onClick={() => router.push(`/vendedor/cliente/${c.nro_cli}`)}
                      className="shrink-0 text-brand/50 hover:text-brand transition-colors"
                      aria-label="Ver cliente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CLIENTES INACTIVOS ── */}
        {tab === "inactivos" && (
          <>
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div>
                <label className="block text-xs font-medium text-brand-dark/70 mb-1">Sin pedidos en los últimos</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={7} max={365} value={diasInactivos}
                    onChange={(e) => setDiasInactivos(Number(e.target.value))}
                    className={`${inputCls} w-20`} />
                  <span className="text-sm text-brand-dark/60">días</span>
                </div>
              </div>
              <button onClick={loadInactivos} disabled={loading} className={btnCls}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Buscar
              </button>
            </div>

            {loading && inactivos.length === 0 ? (
              <p className="text-sm text-brand-dark/50">Cargando...</p>
            ) : inactivos.length === 0 ? (
              <p className="text-sm text-brand-dark/50">No hay clientes inactivos en ese período.</p>
            ) : (
              <div className="space-y-2">
                {inactivos.map((c) => (
                  <div key={c.nro_cli} className="bg-white rounded-xl border border-brand/10 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-dark">{c.cliente || `Cliente ${c.nro_cli}`}</p>
                      <p className="text-xs text-brand-dark/50 mt-0.5">
                        {c.ultimo_pedido
                          ? <>Último pedido: {fmtDate(c.ultimo_pedido)} · <span className="font-medium text-amber-600">{c.dias_sin_pedido} días sin actividad</span></>
                          : <span className="text-red-500/80">Sin pedidos registrados</span>
                        }
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/vendedor/cliente/${c.nro_cli}`)}
                      className="shrink-0 text-brand/50 hover:text-brand transition-colors"
                      aria-label="Ver cliente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-brand-dark/40 text-right pt-1">{inactivos.length} cliente{inactivos.length !== 1 ? "s" : ""}</p>
              </div>
            )}
          </>
        )}

        {/* ── RANKING DE PRODUCTOS ── */}
        {tab === "ranking" && (
          <>
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div>
                <label className="block text-xs font-medium text-brand-dark/70 mb-1">Últimos</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={7} max={365} value={diasRanking}
                    onChange={(e) => setDiasRanking(Number(e.target.value))}
                    className={`${inputCls} w-20`} />
                  <span className="text-sm text-brand-dark/60">días</span>
                </div>
              </div>
              <button onClick={loadRanking} disabled={loading} className={btnCls}>
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
              </button>
            </div>

            {loading && ranking.length === 0 ? (
              <p className="text-sm text-brand-dark/50">Cargando...</p>
            ) : ranking.length === 0 ? (
              <div className="text-center py-12">
                <Package size={36} className="mx-auto text-brand/20 mb-3" />
                <p className="text-sm text-brand-dark/40">Sin datos en el período seleccionado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ranking.map((p, i) => (
                  <div key={p.codart} className="bg-white rounded-xl border border-brand/10 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-dark truncate">{p.nombre}</p>
                      <p className="text-xs text-brand-dark/50 mt-0.5">
                        {p.total_unidades} unid. · {p.total_pedidos} pedido{p.total_pedidos !== 1 ? "s" : ""} · {fmt$(p.monto_total)}
                      </p>
                    </div>
                    <p className="text-xs text-brand-dark/40 shrink-0">{p.codart}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
