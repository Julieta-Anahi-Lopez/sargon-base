"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const { isAuthenticated, user } = useAuth();
  const cartCount = useSelector((s: RootState) =>
    s.cart.items.reduce((n, i) => n + i.cantidad, 0)
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted]   = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-brand-dark shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-24 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/logo.png"
              alt="Ser Natural"
              width={1752}
              height={2012}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/nosotros">Nosotros</NavLink>
            <NavLink href="/catalogo">Catálogo</NavLink>
            {mounted && isAuthenticated && (
              <>
                <NavLink href="/pedidos">Mis pedidos</NavLink>
                <NavLink href="/cuenta">Mi cuenta</NavLink>
                {user?.catusu === "V" && (
                  <NavLink href="/vendedor/nuevo-usuario">Nuevo usuario</NavLink>
                )}
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* User / Login */}
            {mounted && isAuthenticated ? (
              <Link
                href="/cuenta"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-base text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                <User size={16} />
                <span className="max-w-[120px] truncate">{user?.nombre?.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-base font-medium bg-accent hover:bg-accent-dark text-brand-dark transition-colors"
              >
                <User size={15} />
                Ingresar
              </Link>
            )}

            {/* Cart (solo autenticado) */}
            {mounted && isAuthenticated && (
              <button
                onClick={() => setCartOpen(true)}
                className="group relative p-2 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Carrito"
              >
                <Image
                  src="/images/carrito-de-compras.png"
                  alt="Carrito"
                  width={28}
                  height={28}
                  className="invert opacity-70 group-hover:opacity-100 transition-opacity"
                />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-accent text-brand-dark text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Menú"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-24" />

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile nav drawer */}
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`text-base transition-colors relative group ${isActive ? "text-white" : "text-white/80 hover:text-white"}`}
    >
      {children}
      <span className={`absolute -bottom-0.5 left-0 h-0.5 bg-accent transition-all duration-200 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
    </Link>
  );
}
