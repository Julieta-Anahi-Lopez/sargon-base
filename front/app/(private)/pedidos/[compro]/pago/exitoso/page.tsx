"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PagoExitosoPage({ params }: { params: { compro: string } }) {
  return (
    <div className="min-h-screen bg-brand-light/40 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-brand/10 p-8 text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand mb-2">¡Pago realizado!</h1>
          <p className="text-brand-dark/70 mb-1">
            Tu pago para el pedido <span className="font-semibold text-brand-dark">#{params.compro}</span> fue aprobado.
          </p>
          <p className="text-sm text-brand-dark/50 mb-8">
            Estamos procesando tu pedido y nos pondremos en contacto pronto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pedidos" className="bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors">
              Ver mis pedidos
            </Link>
            <Link href="/" className="border-2 border-brand text-brand hover:bg-brand hover:text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
