"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { User, Mail, MapPin, CreditCard, LogOut } from "lucide-react";

interface FieldRowProps {
  label: string;
  value?: string | null;
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-3 border-b border-brand/10 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-brand-dark/60 sm:w-36 shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-brand-dark font-medium">
        {value || <span className="text-brand-dark/50 font-normal italic">No informado</span>}
      </dd>
    </div>
  );
}

export default function CuentaPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { logout: handleLogout } = useAuth();

  if (!user) return null;

  const address = [user.domcal, user.domnro].filter(Boolean).join(" ") || null;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-brand mb-8">Mi cuenta</h1>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center shrink-0">
            <User size={26} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-brand-dark">{user.nombre}</p>
            <p className="text-sm text-brand-dark/70">{user.email}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="space-y-5">
          <section className="bg-white rounded-xl border border-brand/20 px-5 py-2">
            <div className="flex items-center gap-2 py-3 mb-1">
              <Mail size={15} className="text-brand-dark/50" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-dark/70">Contacto</h2>
            </div>
            <dl>
              <FieldRow label="Email" value={user.email} />
            </dl>
          </section>

          <section className="bg-white rounded-xl border border-brand/20 px-5 py-2">
            <div className="flex items-center gap-2 py-3 mb-1">
              <MapPin size={15} className="text-brand-dark/50" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-dark/70">Dirección</h2>
            </div>
            <dl>
              <FieldRow label="Calle y número" value={address} />
            </dl>
          </section>

          <section className="bg-white rounded-xl border border-brand/20 px-5 py-2">
            <div className="flex items-center gap-2 py-3 mb-1">
              <CreditCard size={15} className="text-brand-dark/50" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-dark/70">Datos fiscales</h2>
            </div>
            <dl>
              <FieldRow label="CUIT"      value={user.cuit} />
              <FieldRow label="DNI"       value={user.dni}  />
              <FieldRow label="Cond. IVA" value={user.catIva ?? user.cativa} />
            </dl>
          </section>
        </div>

        <div className="mt-8">
          <Button variant="danger" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
