"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
  </div>
);

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, authChecked } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authChecked, isAuthenticated, router]);

  // Antes de hidratar (o mientras auth inicializa) → siempre spinner.
  // Esto evita el hydration mismatch: servidor y cliente coinciden en el spinner
  // durante la primera pasada, sin importar el estado del store Redux.
  if (!mounted || !authChecked) return <Spinner />;

  if (!isAuthenticated) return null;

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
