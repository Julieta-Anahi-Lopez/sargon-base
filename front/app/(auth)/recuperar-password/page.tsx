"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004/api";

export default function RecuperarPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Error al enviar el email.");
        return;
      }
      setSent(true);
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

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

        {sent ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
              <Mail size={22} className="text-brand" />
            </div>
            <h1 className="text-xl font-bold text-brand mb-2">Revisá tu correo</h1>
            <p className="text-brand-dark/80 text-sm leading-relaxed">
              Si{" "}
              <span className="font-medium text-brand">{email}</span>{" "}
              está registrado, vas a recibir un email con el enlace para restablecer tu contraseña.
            </p>
            <p className="text-brand-dark/60 text-xs mt-4">No olvides revisar la carpeta de spam.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-brand mb-1">¿Olvidaste tu contraseña?</h1>
            <p className="text-brand-dark/80 text-sm mb-8 leading-relaxed">
              Ingresá tu email y te enviamos un enlace para crear una contraseña nueva.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-brand-dark mb-1.5"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-brand/20 bg-white text-brand-darker placeholder-brand/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                  placeholder="tu@email.com"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth loading={loading} className="mt-2">
                Enviar enlace de recuperación
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
