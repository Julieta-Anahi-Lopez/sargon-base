"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Store } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { loginUser } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/Button";
import { CLIENTE } from "@/lib/config";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const returnTo     = searchParams.get("returnTo") || "/catalogo";
  const dispatch     = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, error } = useSelector((s: RootState) => s.auth);

  const [email,    setEmail]    = useState("");
  const [clave,    setClave]    = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace(returnTo);
  }, [isAuthenticated, router, returnTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(loginUser({ email: email.trim(), clave }));
  }

  return (
    <div className="w-full max-w-sm">

      {/* Logo mobile */}
      <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
        <Store size={20} className="text-brand" />
        <span className="text-brand font-black text-xl tracking-wide uppercase">{CLIENTE.nombre}</span>
      </div>

      <h1 className="text-2xl font-bold text-brand mb-1">Bienvenido</h1>
      <p className="text-brand-dark/80 text-sm mb-8">
        Ingresá con tu cuenta para acceder al catálogo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        <div>
          <label htmlFor="email" className="block text-xs font-medium text-brand-dark mb-1.5">
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

        <div>
          <label htmlFor="clave" className="block text-xs font-medium text-brand-dark mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="clave"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              required
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

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth loading={loading} className="mt-2 gap-2">
          <LogIn size={16} />
          Ingresar
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2">
        <Link
          href="/recuperar-password"
          className="text-xs text-brand-dark/60 hover:text-brand transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        {CLIENTE.features.registroLibre ? (
          <p className="text-xs text-brand-dark/50 text-center">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="text-brand-dark hover:text-brand font-medium transition-colors">
              Registrate acá
            </Link>
          </p>
        ) : (
          <p className="text-xs text-brand-dark/50 text-center">
            ¿No tenés cuenta? Contactá a tu vendedor para que te registre.
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-brand-light">

      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-brand flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <Store size={22} className="text-accent" />
          <span className="text-white font-black text-lg tracking-wide uppercase">{CLIENTE.nombre}</span>
        </div>
        <div>
          <blockquote className="text-white text-3xl xl:text-4xl font-bold leading-snug max-w-sm">
            {CLIENTE.eslogan}
          </blockquote>
        </div>
        <p className="text-white/30 text-xs">© {new Date().getFullYear()} {CLIENTE.nombre}</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
