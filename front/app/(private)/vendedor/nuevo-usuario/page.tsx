"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, PencilLine, Trash2, CheckCircle, AlertCircle, Eye, EyeOff, Search, X } from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";

const LOCALIDADES = [
  { value: "8000", label: "Bahía Blanca" },
  { value: "8103", label: "Ingeniero White" },
  { value: "8105", label: "General Daniel Cerri" },
  { value: "8109", label: "Punta Alta" },
  { value: "8118", label: "Cabildo" },
  { value: "8150", label: "Coronel Dorrego" },
  { value: "8153", label: "Monte Hermoso" },
  { value: "8160", label: "Tornquist" },
  { value: "8168", label: "Sierra de la Ventana" },
  { value: "8170", label: "Pigüé" },
  { value: "7530", label: "Coronel Pringles" },
];

const CATEGORIAS_IVA = [
  { value: "CF", label: "Consumidor Final" },
  { value: "1",  label: "Responsable Inscripto" },
  { value: "7",  label: "Monotributista" },
];

type Status = "idle" | "loading" | "success" | "error";
type Modo   = "crear" | "editar";

interface ContactoEncontrado {
  nrocon:  number;
  nombre:  string;
  e_mail:  string | null;
  nrodoc:  string | null;
  telcel:  string | null;
  domcal:  string | null;
  domnro:  string | null;
  locali:  number | null;
  cativa:  string | null;
  cuit:    string | null;
}

interface UsuarioEncontrado {
  codigo: number;
  nombre: string;
  e_mail: string;
  catusu: string;
}

const EMPTY_FORM = {
  nombre:       "",
  e_mail:       "",
  nrodoc:       "",
  clave:        "",
  claveConfirm: "",
  telcel:       "",
  locali:       "",
  domcalle:     "",
  domnro:       "",
  dompis:       "",
  domdep:       "",
  cativa:       "CF",
  cuit:         "",
};

const LIMITS = {
  nombre:   40,
  e_mail:   120,
  nrodoc:   8,
  clave:    8,
  domcalle: 30,
  domnro:   5,
  dompis:   3,
  domdep:   5,
  telcel:   25,
  cuit:     13,
};

function validate(form: typeof EMPTY_FORM, esExistente: boolean): string | null {
  if (!form.e_mail.trim())
    return "El email es obligatorio.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.e_mail.trim()))
    return "El formato del email no es válido.";

  if (form.clave && form.clave.length > LIMITS.clave)
    return `La contraseña no puede superar ${LIMITS.clave} caracteres.`;
  if (form.clave !== form.claveConfirm)
    return "Las contraseñas no coinciden.";

  if (!esExistente) {
    if (!form.nombre.trim())
      return "El nombre es obligatorio.";
    if (!form.nrodoc.trim())
      return "El DNI es obligatorio.";
    if (!/^\d{7,8}$/.test(form.nrodoc.trim()))
      return "El DNI debe tener 7 u 8 dígitos numéricos.";
    if (!form.locali)
      return "Seleccioná una localidad.";
  }

  return null;
}

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const { user, isAuthenticated, authChecked, token } = useAuth();

  const [modo, setModo] = useState<Modo>("crear");

  // ── Modo Crear ──────────────────────────────────────────────────
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [statusCrear,   setStatusCrear]   = useState<Status>("idle");
  const [msgCrear,      setMsgCrear]      = useState("");
  const [showClave,     setShowClave]     = useState(false);
  const [showConf,      setShowConf]      = useState(false);

  const [nroconInput,   setNroconInput]   = useState("");
  const [buscando,      setBuscando]      = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [contacto,      setContacto]      = useState<ContactoEncontrado | null>(null);

  // ── Modo Editar ─────────────────────────────────────────────────
  const [busquedaEditar,      setBusquedaEditar]      = useState("");
  const [tipoBusquedaEditar,  setTipoBusquedaEditar]  = useState<"email" | "nrocon">("email");
  const [buscandoEditar,      setBuscandoEditar]      = useState(false);
  const [errorBusqEditar,     setErrorBusqEditar]     = useState("");
  const [usuarioEditar,       setUsuarioEditar]       = useState<UsuarioEncontrado | null>(null);

  const [editEmail,       setEditEmail]       = useState("");
  const [editClave,       setEditClave]       = useState("");
  const [editClaveConf,   setEditClaveConf]   = useState("");
  const [showEditClave,   setShowEditClave]   = useState(false);
  const [showEditConf,    setShowEditConf]    = useState(false);

  // Para reasignar NroCon en modo edición
  const [nroconEditInput,  setNroconEditInput]  = useState("");
  const [buscandoNrocon,   setBuscandoNrocon]   = useState(false);
  const [errorNrocon,      setErrorNrocon]      = useState("");
  const [nuevoContacto,    setNuevoContacto]    = useState<ContactoEncontrado | null>(null);

  const [statusEditar,   setStatusEditar]   = useState<Status>("idle");
  const [msgEditar,      setMsgEditar]      = useState("");
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [eliminando,     setEliminando]     = useState(false);

  useEffect(() => {
    if (authChecked && (!isAuthenticated || user?.catusu !== "V")) {
      router.replace("/catalogo");
    }
  }, [authChecked, isAuthenticated, user, router]);

  if (!authChecked || !isAuthenticated || user?.catusu !== "V") return null;

  function getToken() {
    return token ?? (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
  }

  // ── Handlers Crear ──────────────────────────────────────────────

  async function buscarContacto() {
    const nrocon = parseInt(nroconInput.trim());
    if (!nrocon || isNaN(nrocon)) {
      setErrorBusqueda("Ingresá un número de cliente válido.");
      return;
    }
    setBuscando(true);
    setErrorBusqueda("");
    setContacto(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${nrocon}/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        setErrorBusqueda("No se encontró ningún cliente con ese número.");
        return;
      }
      const data: ContactoEncontrado = await res.json();
      setContacto(data);
      setForm((prev) => ({ ...prev, e_mail: data.e_mail ?? "" }));
    } catch {
      setErrorBusqueda("Error de conexión al buscar el cliente.");
    } finally {
      setBuscando(false);
    }
  }

  function limpiarBusqueda() {
    setContacto(null);
    setNroconInput("");
    setErrorBusqueda("");
    setForm(EMPTY_FORM);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validate(form, !!contacto);
    if (validationError) {
      setStatusCrear("error");
      setMsgCrear(validationError);
      return;
    }

    setStatusCrear("loading");
    setMsgCrear("");

    const payload: Record<string, unknown> = {
      e_mail: form.e_mail.trim(),
      clave:  form.clave.trim() || "1234",
    };

    if (contacto) {
      payload.nrocon_existente = contacto.nrocon;
    } else {
      payload.nombre   = form.nombre.trim();
      payload.nrodoc   = form.nrodoc.trim();
      payload.locali   = Number(form.locali);
      payload.cativa   = form.cativa;
      if (form.telcel.trim())   payload.telcel   = form.telcel.trim();
      if (form.domcalle.trim()) payload.domcalle = form.domcalle.trim();
      if (form.domnro.trim())   payload.domnro   = form.domnro.trim();
      if (form.dompis.trim())   payload.dompis   = form.dompis.trim();
      if (form.domdep.trim())   payload.domdep   = form.domdep.trim();
      if (form.cativa !== "CF") payload.cuit = form.cuit.trim();
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web-usuarios/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusCrear("error");
        setMsgCrear(data.error ?? data.detail ?? "Error al crear el usuario.");
        return;
      }
      setStatusCrear("success");
      setMsgCrear(
        data.actualizado
          ? `Acceso habilitado para "${data.nombre}" (código ${data.codigo}).`
          : `Usuario "${data.nombre}" creado correctamente (código ${data.codigo}).`
      );
    } catch {
      setStatusCrear("error");
      setMsgCrear("Error de conexión con el servidor.");
    }
  }

  // ── Handlers Editar ─────────────────────────────────────────────

  async function buscarUsuario() {
    const q = busquedaEditar.trim();
    if (!q) {
      setErrorBusqEditar("Ingresá un valor para buscar.");
      return;
    }
    setBuscandoEditar(true);
    setErrorBusqEditar("");
    setUsuarioEditar(null);
    setNuevoContacto(null);
    setNroconEditInput("");

    const param = tipoBusquedaEditar === "email" ? `email=${encodeURIComponent(q)}` : `nrocon=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web-usuarios/buscar/?${param}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorBusqEditar(data.error ?? "No se encontró el usuario.");
        return;
      }
      const u: UsuarioEncontrado = data;
      setUsuarioEditar(u);
      setEditEmail(u.e_mail);
      setEditClave("");
      setEditClaveConf("");
    } catch {
      setErrorBusqEditar("Error de conexión.");
    } finally {
      setBuscandoEditar(false);
    }
  }

  async function buscarNuevoContacto() {
    const nrocon = parseInt(nroconEditInput.trim());
    if (!nrocon || isNaN(nrocon)) {
      setErrorNrocon("Ingresá un número de cliente válido.");
      return;
    }
    setBuscandoNrocon(true);
    setErrorNrocon("");
    setNuevoContacto(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contactos/${nrocon}/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        setErrorNrocon("No se encontró ningún cliente con ese número.");
        return;
      }
      const data: ContactoEncontrado = await res.json();
      setNuevoContacto(data);
    } catch {
      setErrorNrocon("Error de conexión.");
    } finally {
      setBuscandoNrocon(false);
    }
  }

  async function handleEditar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioEditar) return;

    if (editEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      setStatusEditar("error");
      setMsgEditar("El formato del email no es válido.");
      return;
    }
    if (editClave && editClave.length > LIMITS.clave) {
      setStatusEditar("error");
      setMsgEditar(`La contraseña no puede superar ${LIMITS.clave} caracteres.`);
      return;
    }
    if (editClave !== editClaveConf) {
      setStatusEditar("error");
      setMsgEditar("Las contraseñas no coinciden.");
      return;
    }

    setStatusEditar("loading");
    setMsgEditar("");

    const payload: Record<string, unknown> = { codigo_actual: usuarioEditar.codigo };
    if (editEmail.trim() && editEmail.trim() !== usuarioEditar.e_mail)
      payload.e_mail = editEmail.trim();
    if (editClave.trim())
      payload.clave = editClave.trim();
    if (nuevoContacto)
      payload.nuevo_nrocon = nuevoContacto.nrocon;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web-usuarios/editar/`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusEditar("error");
        setMsgEditar(data.error ?? "Error al guardar los cambios.");
        return;
      }
      setStatusEditar("success");
      setMsgEditar(`Usuario "${data.nombre}" actualizado correctamente (código ${data.codigo}).`);
    } catch {
      setStatusEditar("error");
      setMsgEditar("Error de conexión con el servidor.");
    }
  }

  async function handleEliminar() {
    if (!usuarioEditar) return;
    setEliminando(true);
    setMsgEditar("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web-usuarios/eliminar/`, {
        method:  "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ codigo: usuarioEditar.codigo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusEditar("error");
        setMsgEditar(data.error ?? "Error al eliminar el usuario.");
        return;
      }
      setStatusEditar("success");
      setMsgEditar(`Usuario "${data.nombre}" eliminado. El acceso web fue revocado y su carrito fue vaciado.`);
    } catch {
      setStatusEditar("error");
      setMsgEditar("Error de conexión con el servidor.");
    } finally {
      setEliminando(false);
      setConfirmDelete(false);
    }
  }

  function resetEditar() {
    setStatusEditar("idle");
    setMsgEditar("");
    setUsuarioEditar(null);
    setBusquedaEditar("");
    setNuevoContacto(null);
    setNroconEditInput("");
    setEditEmail("");
    setEditClave("");
    setEditClaveConf("");
    setErrorBusqEditar("");
    setErrorNrocon("");
    setConfirmDelete(false);
  }

  // ── Estilos ─────────────────────────────────────────────────────
  const inputClass    = "w-full px-3 py-2.5 rounded-lg border border-brand/20 bg-brand-light/30 text-brand-darker placeholder-brand/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition";
  const readonlyClass = "w-full px-3 py-2.5 rounded-lg border border-brand/10 bg-brand-light/60 text-brand-dark/70 text-sm cursor-not-allowed";
  const labelClass    = "block text-xs font-medium text-brand-dark mb-1.5";

  return (
    <div className="min-h-screen bg-brand-light/40 py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center shrink-0">
            {modo === "crear" ? <UserPlus size={20} className="text-white" /> : <PencilLine size={20} className="text-white" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand leading-none">
              {modo === "crear" ? "Nuevo usuario" : "Editar usuario"}
            </h1>
            <p className="text-brand-dark/70 text-sm mt-0.5">
              {modo === "crear" ? "Creá una cuenta para un nuevo cliente" : "Corregí los datos de un usuario existente"}
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl border border-brand/20 overflow-hidden mb-6 bg-white">
          {(["crear", "editar"] as Modo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setModo(m); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                modo === m
                  ? "bg-brand text-white"
                  : "text-brand-dark/60 hover:bg-brand-light/50"
              }`}
            >
              {m === "crear" ? "Crear usuario" : "Editar usuario"}
            </button>
          ))}
        </div>

        {/* ─────────────── MODO CREAR ─────────────── */}
        {modo === "crear" && (
          <>
            {statusCrear === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-6 py-6 text-sm">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle size={20} className="shrink-0 mt-0.5" />
                  <span className="text-base font-medium">{msgCrear}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setStatusCrear("idle"); setMsgCrear(""); setForm(EMPTY_FORM); setContacto(null); setNroconInput(""); }}
                  className="ml-8 text-xs font-semibold underline underline-offset-2 hover:text-green-900 transition-colors"
                >
                  Crear otro usuario
                </button>
              </div>
            )}

            {statusCrear !== "success" && (
              <>
                {/* Búsqueda de contacto existente */}
                <div className="bg-white rounded-2xl shadow-sm border border-brand/10 p-6 mb-4">
                  <p className="text-xs font-semibold text-brand-dark/80 uppercase tracking-widest mb-3">
                    ¿El cliente ya existe en el sistema?
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={nroconInput}
                      onChange={(e) => setNroconInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && buscarContacto()}
                      placeholder="Número de cliente"
                      disabled={!!contacto}
                      className={`${inputClass} flex-1`}
                    />
                    {contacto ? (
                      <button type="button" onClick={limpiarBusqueda}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
                        <X size={15} /> Limpiar
                      </button>
                    ) : (
                      <button type="button" onClick={buscarContacto} disabled={buscando}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium transition-colors disabled:opacity-50">
                        <Search size={15} /> {buscando ? "Buscando..." : "Buscar"}
                      </button>
                    )}
                  </div>
                  {errorBusqueda && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={13} /> {errorBusqueda}
                    </p>
                  )}
                  {contacto && (
                    <div className="mt-3 rounded-lg bg-brand-light border border-brand/20 px-4 py-3">
                      <p className="text-xs font-bold text-brand mb-1">Cliente encontrado</p>
                      <p className="text-sm text-brand font-semibold">{contacto.nombre}</p>
                      <p className="text-xs text-brand-dark/70">N° {contacto.nrocon}{contacto.nrodoc ? ` · DNI ${contacto.nrodoc}` : ""}</p>
                    </div>
                  )}
                </div>

                {statusCrear === "error" && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{msgCrear}</span>
                  </div>
                )}

                <form onSubmit={handleCrear} className="bg-white rounded-2xl shadow-sm border border-brand/10 p-6 sm:p-8 space-y-5" noValidate>

                  {!contacto && (
                    <>
                      <div>
                        <label htmlFor="nombre" className={labelClass}>
                          Nombre completo * <span className="text-brand-dark/50 font-normal">(máx. {LIMITS.nombre} caracteres)</span>
                        </label>
                        <input id="nombre" name="nombre" type="text" required maxLength={LIMITS.nombre}
                          value={form.nombre} onChange={handleChange} className={inputClass} placeholder="Juan García" />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="nrodoc" className={labelClass}>DNI * <span className="text-brand-dark/50 font-normal">(7 u 8 dígitos)</span></label>
                          <input id="nrodoc" name="nrodoc" type="text" required maxLength={LIMITS.nrodoc} inputMode="numeric"
                            value={form.nrodoc} onChange={handleChange} className={inputClass} placeholder="30123456" />
                        </div>
                        <div>
                          <label htmlFor="telcel" className={labelClass}>Celular</label>
                          <input id="telcel" name="telcel" type="text" maxLength={LIMITS.telcel} inputMode="numeric"
                            value={form.telcel} onChange={handleChange} className={inputClass} placeholder="2914000000" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="locali" className={labelClass}>Localidad *</label>
                        <select id="locali" name="locali" required value={form.locali} onChange={handleChange} className={inputClass}>
                          <option value="" disabled>Seleccioná...</option>
                          {LOCALIDADES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid sm:grid-cols-[2fr_1fr_1fr_1fr] gap-4">
                        <div>
                          <label htmlFor="domcalle" className={labelClass}>Calle</label>
                          <input id="domcalle" name="domcalle" type="text" maxLength={LIMITS.domcalle}
                            value={form.domcalle} onChange={handleChange} className={inputClass} placeholder="Av. Alem" />
                        </div>
                        <div>
                          <label htmlFor="domnro" className={labelClass}>Número</label>
                          <input id="domnro" name="domnro" type="text" maxLength={LIMITS.domnro}
                            value={form.domnro} onChange={handleChange} className={inputClass} placeholder="1234" />
                        </div>
                        <div>
                          <label htmlFor="dompis" className={labelClass}>Piso</label>
                          <input id="dompis" name="dompis" type="text" maxLength={LIMITS.dompis}
                            value={form.dompis} onChange={handleChange} className={inputClass} placeholder="2" />
                        </div>
                        <div>
                          <label htmlFor="domdep" className={labelClass}>Depto</label>
                          <input id="domdep" name="domdep" type="text" maxLength={LIMITS.domdep}
                            value={form.domdep} onChange={handleChange} className={inputClass} placeholder="A" />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cativa" className={labelClass}>Categoría IVA *</label>
                          <select id="cativa" name="cativa" required value={form.cativa} onChange={handleChange} className={inputClass}>
                            {CATEGORIAS_IVA.map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        {form.cativa !== "CF" && (
                          <div>
                            <label htmlFor="cuit" className={labelClass}>CUIT * <span className="text-brand-dark/50 font-normal">(XX-XXXXXXXX-X)</span></label>
                            <input id="cuit" name="cuit" type="text" required maxLength={LIMITS.cuit}
                              value={form.cuit} onChange={handleChange} className={inputClass} placeholder="20-30123456-7" />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {contacto && (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className={labelClass}>Nombre</p>
                          <div className={readonlyClass}>{contacto.nombre}</div>
                        </div>
                        <div>
                          <p className={labelClass}>DNI</p>
                          <div className={readonlyClass}>{contacto.nrodoc || "—"}</div>
                        </div>
                      </div>
                      {(contacto.domcal || contacto.telcel) && (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {contacto.domcal && (
                            <div>
                              <p className={labelClass}>Dirección</p>
                              <div className={readonlyClass}>{contacto.domcal} {contacto.domnro ?? ""}</div>
                            </div>
                          )}
                          {contacto.telcel && (
                            <div>
                              <p className={labelClass}>Celular</p>
                              <div className={readonlyClass}>{contacto.telcel}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="e_mail" className={labelClass}>Email * (credencial de acceso)</label>
                    <input id="e_mail" name="e_mail" type="email" required maxLength={LIMITS.e_mail}
                      value={form.e_mail} onChange={handleChange} className={inputClass} placeholder="juan@ejemplo.com" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clave" className={labelClass}>
                        Contraseña inicial <span className="text-brand-dark/50 font-normal">(máx. {LIMITS.clave})</span>
                      </label>
                      <div className="relative">
                        <input id="clave" name="clave" type={showClave ? "text" : "password"} maxLength={LIMITS.clave}
                          value={form.clave} onChange={handleChange} className={`${inputClass} pr-10`} placeholder="••••" />
                        <button type="button" onClick={() => setShowClave((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand transition-colors"
                          aria-label={showClave ? "Ocultar" : "Mostrar"}>
                          {showClave ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <p className="text-xs text-brand-dark/60 mt-1">Vacío → usa &ldquo;1234&rdquo;.</p>
                    </div>
                    <div>
                      <label htmlFor="claveConfirm" className={labelClass}>Confirmar contraseña</label>
                      <div className="relative">
                        <input id="claveConfirm" name="claveConfirm" type={showConf ? "text" : "password"} maxLength={LIMITS.clave}
                          value={form.claveConfirm} onChange={handleChange} className={`${inputClass} pr-10`} placeholder="••••" />
                        <button type="button" onClick={() => setShowConf((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand transition-colors"
                          aria-label={showConf ? "Ocultar" : "Mostrar"}>
                          {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" fullWidth loading={statusCrear === "loading"} className="mt-2 gap-2">
                    <UserPlus size={16} />
                    Crear usuario
                  </Button>
                </form>
              </>
            )}
          </>
        )}

        {/* ─────────────── MODO EDITAR ─────────────── */}
        {modo === "editar" && (
          <>
            {statusEditar === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-6 py-6 text-sm">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle size={20} className="shrink-0 mt-0.5" />
                  <span className="text-base font-medium">{msgEditar}</span>
                </div>
                <button type="button" onClick={resetEditar}
                  className="ml-8 text-xs font-semibold underline underline-offset-2 hover:text-green-900 transition-colors">
                  Editar otro usuario
                </button>
              </div>
            )}

            {statusEditar !== "success" && (
              <>
                {/* Buscar usuario a editar */}
                <div className="bg-white rounded-2xl shadow-sm border border-brand/10 p-6 mb-4">
                  <p className="text-xs font-semibold text-brand-dark/80 uppercase tracking-widest mb-3">
                    Buscar usuario existente
                  </p>

                  <div className="flex gap-3 mb-3">
                    {(["email", "nrocon"] as const).map((t) => (
                      <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="tipoBusqueda" value={t}
                          checked={tipoBusquedaEditar === t}
                          onChange={() => { setTipoBusquedaEditar(t); setBusquedaEditar(""); setErrorBusqEditar(""); }}
                          className="accent-brand" />
                        <span className="text-xs text-brand-dark font-medium">
                          {t === "email" ? "Por email" : "Por N° de cliente"}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type={tipoBusquedaEditar === "email" ? "email" : "number"}
                      value={busquedaEditar}
                      onChange={(e) => setBusquedaEditar(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !usuarioEditar && buscarUsuario()}
                      placeholder={tipoBusquedaEditar === "email" ? "juan@ejemplo.com" : "Número de cliente"}
                      disabled={!!usuarioEditar}
                      className={`${inputClass} flex-1`}
                    />
                    {usuarioEditar ? (
                      <button type="button" onClick={resetEditar}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
                        <X size={15} /> Limpiar
                      </button>
                    ) : (
                      <button type="button" onClick={buscarUsuario} disabled={buscandoEditar}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium transition-colors disabled:opacity-50">
                        <Search size={15} /> {buscandoEditar ? "Buscando..." : "Buscar"}
                      </button>
                    )}
                  </div>

                  {errorBusqEditar && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={13} /> {errorBusqEditar}
                    </p>
                  )}

                  {usuarioEditar && (
                    <div className="mt-3 rounded-lg bg-brand-light border border-brand/20 px-4 py-3">
                      <p className="text-xs font-bold text-brand mb-1">Usuario encontrado</p>
                      <p className="text-sm text-brand font-semibold">{usuarioEditar.nombre}</p>
                      <p className="text-xs text-brand-dark/70">N° {usuarioEditar.codigo} · {usuarioEditar.e_mail}</p>
                    </div>
                  )}
                </div>

                {usuarioEditar && (
                  <>
                    {statusEditar === "error" && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{msgEditar}</span>
                      </div>
                    )}

                    <form onSubmit={handleEditar} className="bg-white rounded-2xl shadow-sm border border-brand/10 p-6 sm:p-8 space-y-5" noValidate>

                      {/* Email */}
                      <div>
                        <label htmlFor="editEmail" className={labelClass}>Email</label>
                        <input id="editEmail" type="email" maxLength={LIMITS.e_mail}
                          value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                          className={inputClass} placeholder="juan@ejemplo.com" />
                      </div>

                      {/* Contraseña */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="editClave" className={labelClass}>
                            Nueva contraseña <span className="text-brand-dark/50 font-normal">(máx. {LIMITS.clave}) — dejar vacío para no cambiar</span>
                          </label>
                          <div className="relative">
                            <input id="editClave" type={showEditClave ? "text" : "password"} maxLength={LIMITS.clave}
                              value={editClave} onChange={(e) => setEditClave(e.target.value)}
                              className={`${inputClass} pr-10`} placeholder="••••" />
                            <button type="button" onClick={() => setShowEditClave((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand transition-colors"
                              aria-label={showEditClave ? "Ocultar" : "Mostrar"}>
                              {showEditClave ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="editClaveConf" className={labelClass}>Confirmar contraseña</label>
                          <div className="relative">
                            <input id="editClaveConf" type={showEditConf ? "text" : "password"} maxLength={LIMITS.clave}
                              value={editClaveConf} onChange={(e) => setEditClaveConf(e.target.value)}
                              className={`${inputClass} pr-10`} placeholder="••••" />
                            <button type="button" onClick={() => setShowEditConf((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand transition-colors"
                              aria-label={showEditConf ? "Ocultar" : "Mostrar"}>
                              {showEditConf ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Reasignar NroCon */}
                      <div>
                        <p className={labelClass}>Reasignar a otro cliente (opcional)</p>
                        <p className="text-xs text-brand-dark/60 mb-2">
                          Solo si el usuario quedó asociado al número de cliente incorrecto.
                          El carrito se reasigna al nuevo número; el número anterior queda libre.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={nroconEditInput}
                            onChange={(e) => { setNroconEditInput(e.target.value); setNuevoContacto(null); setErrorNrocon(""); }}
                            onKeyDown={(e) => e.key === "Enter" && buscarNuevoContacto()}
                            placeholder="Nuevo N° de cliente"
                            disabled={!!nuevoContacto}
                            className={`${inputClass} flex-1`}
                          />
                          {nuevoContacto ? (
                            <button type="button" onClick={() => { setNuevoContacto(null); setNroconEditInput(""); setErrorNrocon(""); }}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
                              <X size={15} /> Quitar
                            </button>
                          ) : (
                            <button type="button" onClick={buscarNuevoContacto} disabled={buscandoNrocon}
                              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium transition-colors disabled:opacity-50">
                              <Search size={15} /> {buscandoNrocon ? "..." : "Buscar"}
                            </button>
                          )}
                        </div>

                        {errorNrocon && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle size={13} /> {errorNrocon}
                          </p>
                        )}

                        {nuevoContacto && (
                          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                            <p className="text-xs font-bold text-amber-700 mb-1">Se reasignará a este cliente</p>
                            <p className="text-sm text-amber-800 font-semibold">{nuevoContacto.nombre}</p>
                            <p className="text-xs text-amber-700/70">N° {nuevoContacto.nrocon}{nuevoContacto.nrodoc ? ` · DNI ${nuevoContacto.nrodoc}` : ""}</p>
                            <p className="text-xs text-amber-600/80 mt-1">El carrito se mueve junto con el usuario. El número anterior queda libre.</p>
                          </div>
                        )}
                      </div>

                      <Button type="submit" fullWidth loading={statusEditar === "loading"} className="mt-2 gap-2">
                        <PencilLine size={16} />
                        Guardar cambios
                      </Button>
                    </form>

                    {/* Zona de peligro — eliminar usuario */}
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-1">Zona de peligro</p>
                      <p className="text-xs text-red-600/80 mb-3">
                        Elimina el acceso web del cliente y vacía su carrito. Esta acción no se puede deshacer.
                      </p>
                      {!confirmDelete ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors"
                        >
                          <Trash2 size={15} /> Eliminar acceso web
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-red-700 font-medium">¿Confirmás la eliminación?</span>
                          <button
                            type="button"
                            onClick={handleEliminar}
                            disabled={eliminando}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {eliminando ? "Eliminando..." : "Sí, eliminar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(false)}
                            className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
