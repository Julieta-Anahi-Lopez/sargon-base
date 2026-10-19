"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Package, Home } from "lucide-react";

export default function PedidoConfirmadoPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 30000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-light/40 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-dark/80 hover:text-brand transition-colors text-sm">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-brand/10 p-8">
          <div className="text-center mb-8">
            <CheckCircle size={72} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-brand mb-2">¡Pedido confirmado!</h1>
            <p className="text-brand-dark/80">Recibimos tu pedido correctamente. En breve nos ponemos en contacto.</p>
          </div>

          <div className="bg-brand-light/50 rounded-xl p-6 mb-8 space-y-4">
            <h2 className="font-semibold text-brand">Próximos pasos</h2>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Package size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-brand font-medium text-sm">Procesamiento del pedido</p>
                <p className="text-brand-dark/70 text-sm">Estamos preparando tu pedido y te contactaremos pronto para confirmar los detalles.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Home size={18} className="text-brand" />
              </div>
              <div>
                <p className="text-brand font-medium text-sm">Coordinación de entrega</p>
                <p className="text-brand-dark/70 text-sm">Te contactaremos para coordinar el método de pago y la entrega.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="text-center bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors">
              Volver al inicio
            </Link>
            <Link href="/catalogo" className="text-center border-2 border-brand text-brand hover:bg-brand hover:text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
