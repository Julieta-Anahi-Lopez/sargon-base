"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { CLIENTE } from "@/lib/config";
import { Button } from "@/components/ui/Button";

interface FormData {
  nombre:   string;
  e_mail:   string;
  nrodoc:   string;
  domcalle: string;
  domnro:   string;
  locali:   string;
  telcel:   string;
  cativa:   string;
  cuit:     string;
  clave:    string;
  claveConfirm: string;
}

const INITIAL: FormData = {
  nombre: "", e_mail: "", nrodoc: "", domcalle: "", domnro: "",
  locali: "", telcel: "", cativa: "", cuit: "", clave: "", claveConfirm: "",
};

const cativaRequiereCuit = (v: string) => v === "1" || v === "7";

function validate(data: FormData, sinNumero: boolean): string | null {
  if (!data.nombre || !data.e_mail || !data.nrodoc || !data.domcalle || !data.locali || !data.cativa)
    return "Completá todos los campos obligatorios.";
  if (!sinNumero && !data.domnro)
    return "Ingresá el número de domicilio o marcá 'Sin número'.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.e_mail))
    return "El email no tiene un formato válido.";
  if (!/^\d{7,8}$/.test(data.nrodoc))
    return "El DNI debe tener entre 7 y 8 dígitos.";
  if (data.telcel && !/^\d{5,25}$/.test(data.telcel))
    return "El teléfono debe contener solo dígitos.";
  if (cativaRequiereCuit(data.cativa)) {
    if (!data.cuit) return "El CUIT es obligatorio para Responsable Inscripto y Monotributista.";
    if (!/^\d{2}-\d{8}-\d$/.test(data.cuit)) return "El CUIT debe tener el formato XX-XXXXXXXX-X.";
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(data.clave))
    return "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";
  if (data.clave !== data.claveConfirm)
    return "Las contraseñas no coinciden.";
  return null;
}

export function RegisterForm() {
  const router = useRouter();
  const [form,       setForm]       = useState<FormData>(INITIAL);
  const [sinNumero,  setSinNumero]  = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [showPass2,  setShowPass2]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(form, sinNumero);
    if (err) { setError(err); return; }

    try {
      setLoading(true);
      setError(null);
      const body = {
        nombre:   form.nombre,
        clave:    form.clave,
        e_mail:   form.e_mail,
        catusu:   "C",
        gposeg:   0,
        telcel:   form.telcel || "",
        nrodoc:   form.nrodoc,
        locali:   form.locali,
        domcalle: form.domcalle,
        domnro:   sinNumero ? "S/N" : form.domnro,
        cativa:   form.cativa,
        ...(cativaRequiereCuit(form.cativa) && { cuit: form.cuit }),
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/web-usuarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.detail || `Error ${res.status}`);
      }
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <UserPlus size={24} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">¡Registro exitoso!</h2>
        <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-brand mb-1">Crear cuenta</h1>
      <p className="text-sm text-gray-500 mb-8">
        Completá tus datos para acceder al catálogo de {CLIENTE.nombre}.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        <Field label="Nombre completo *">
          <input name="nombre" value={form.nombre} onChange={handle} placeholder="Juan Pérez" required className={inputCls} />
        </Field>

        <Field label="Email *">
          <input name="e_mail" type="email" value={form.e_mail} onChange={handle} placeholder="tu@email.com" required className={inputCls} />
        </Field>

        <Field label="DNI *">
          <input name="nrodoc" value={form.nrodoc} onChange={handle} inputMode="numeric" placeholder="12345678" required className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Calle *">
            <input name="domcalle" value={form.domcalle} onChange={handle} placeholder="San Martín" required className={inputCls} />
          </Field>
          <Field label="Número *">
            <input
              name="domnro"
              value={sinNumero ? "S/N" : form.domnro}
              onChange={handle}
              disabled={sinNumero}
              inputMode="numeric"
              placeholder="123"
              className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-400`}
            />
            <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sinNumero}
                onChange={() => setSinNumero((v) => !v)}
                className="rounded border-gray-300 text-brand-dark"
              />
              <span className="text-xs text-gray-500">Sin número</span>
            </label>
          </Field>
        </div>

        <Field label="Localidad *">
          <select name="locali" value={form.locali} onChange={handle} required className={inputCls}>
            <option value="">Seleccioná una localidad</option>
            {CLIENTE.localidades.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Teléfono celular">
          <input name="telcel" value={form.telcel} onChange={handle} inputMode="numeric" placeholder="2914000000" className={inputCls} />
        </Field>

        <Field label="Condición frente al IVA *">
          <select name="cativa" value={form.cativa} onChange={handle} required className={inputCls}>
            <option value="">Seleccioná una opción</option>
            <option value="1">Responsable Inscripto</option>
            <option value="7">Monotributista</option>
            <option value="4">Consumidor Final</option>
          </select>
        </Field>

        {cativaRequiereCuit(form.cativa) && (
          <Field label="CUIT *">
            <input
              name="cuit"
              value={form.cuit}
              onChange={handle}
              placeholder="20-12345678-9"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Formato: XX-XXXXXXXX-X</p>
          </Field>
        )}

        <Field label="Contraseña *">
          <div className="relative">
            <input
              name="clave"
              type={showPass ? "text" : "password"}
              value={form.clave}
              onChange={handle}
              placeholder="••••••••"
              required
              className={`${inputCls} pr-10`}
            />
            <button type="button" onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPass ? "Ocultar" : "Mostrar"}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, mayúsculas, minúsculas y números.</p>
        </Field>

        <Field label="Confirmar contraseña *">
          <div className="relative">
            <input
              name="claveConfirm"
              type={showPass2 ? "text" : "password"}
              value={form.claveConfirm}
              onChange={handle}
              placeholder="••••••••"
              required
              className={`${inputCls} pr-10`}
            />
            <button type="button" onClick={() => setShowPass2((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPass2 ? "Ocultar" : "Mostrar"}>
              {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Button type="submit" fullWidth loading={loading} className="mt-2 gap-2">
          <UserPlus size={16} />
          Crear cuenta
        </Button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-brand/20 bg-white text-brand-darker placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-brand-dark mb-1.5">{label}</label>
      {children}
    </div>
  );
}
