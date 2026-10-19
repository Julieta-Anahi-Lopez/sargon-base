"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004/api";

function NuevaPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [clave,    setClave]    = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-brand-dark/80 text-sm mb-4">El enlace es inválido o ya fue usado.</p>
        <Link
          href="/recuperar-password"
          className="text-brand hover:text-brand-dark text-sm font-medium underline underline-offset-2"
        >
          Solicitá uno nuevo
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (clave.length > 8) {
      setError("La contraseña no puede superar los 8 caracteres.");
      return;
    }
    if (clave !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nueva_clave: clave }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "No se pudo restablecer la contraseña.");
        return;
      }
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
          <CheckCircle size={22} className="text-brand" />
        </div>
        <h1 className="text-xl font-bold text-brand mb-2">Contraseña actualizada</h1>
        <p className="text-brand-dark/70 text-sm">Redirigiendo al login…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-brand mb-1">Nueva contraseña</h1>
      <p className="text-brand-dark/80 text-sm mb-8 leading-relaxed">
        Elegí una contraseña nueva para tu cuenta.{" "}
        <span className="text-brand-dark/50">Máximo 8 caracteres.</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="clave" className="block text-xs font-medium text-brand-dark mb-1.5">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="clave"
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              required
              maxLength={8}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-brand/20 bg-white text-brand-darker placeholder-brand/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/40 hover:text-brand transition-colors"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-xs font-medium text-brand-dark mb-1.5">
            Confirmá la contraseña
          </label>
          <input
            id="confirm"
            type={showPass ? "text" : "password"}
            autoComplete="new-password"
            required
            maxLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-brand/20 bg-white text-brand-darker placeholder-brand/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Guardar contraseña
        </Button>
      </form>
    </>
  );
}

export default function NuevaPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-brand-light">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-brand-dark/60 hover:text-brand mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al login
        </Link>

        <Suspense fallback={<p className="text-brand-dark/70 text-sm">Cargando…</p>}>
          <NuevaPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
