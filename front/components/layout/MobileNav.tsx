"use client";

import Link from "next/link";
import { X, Home, BookOpen, Package, User, LogIn, LogOut, Info, UserPlus } from "lucide-react";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Props {
  open:    boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: Props) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  if (!open) return null;

  function handleLogout() {
    logout();
    onClose();
    router.push("/login");
  }

  const links = [
    { href: "/",          label: "Inicio",      icon: <Home size={18} /> },
    { href: "/nosotros",  label: "Nosotros",    icon: <Info size={18} /> },
    { href: "/catalogo",  label: "Catálogo",    icon: <BookOpen size={18} /> },
    ...(isAuthenticated
      ? [
          { href: "/pedidos",                  label: "Mis pedidos",   icon: <Package  size={18} /> },
          { href: "/cuenta",                   label: "Mi cuenta",     icon: <User     size={18} /> },
          ...(user?.catusu === "V"
            ? [{ href: "/vendedor/nuevo-usuario", label: "Nuevo usuario", icon: <UserPlus size={18} /> }]
            : []),
        ]
      : []),
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 fade-in" onClick={onClose} aria-hidden />

      <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-brand flex flex-col drawer-enter shadow-drawer">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">Menú</span>
          <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white rounded-md hover:bg-brand-dark transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* User greeting */}
        {isAuthenticated && user && (
          <div className="px-5 py-4 border-b border-white/20">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Bienvenido</p>
            <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
          </div>
        )}

        {/* Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:text-white hover:bg-brand-dark transition-colors text-sm"
            >
              <span className="text-accent">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer action */}
        <div className="px-3 py-4 border-t border-white/20">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-white/70 hover:text-white hover:bg-red-900/40 transition-colors text-sm"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg bg-accent hover:bg-accent-dark text-brand-dark text-sm font-medium transition-colors"
            >
              <LogIn size={18} />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
