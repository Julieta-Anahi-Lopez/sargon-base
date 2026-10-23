"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PagoFallidoPage({ params }: { params: { compro: string } }) {
  return (
    <div className="min-h-screen bg-brand-light/40 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-brand/10 p-8 text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-brand mb-2">El pago no se completó</h1>
          <p className="text-brand-dark/70 mb-1">
            No pudimos procesar el pago del pedido <span className="font-semibold text-brand-dark">#{params.compro}</span>.
          </p>
          <p className="text-sm text-brand-dark/50 mb-8">
            Podés intentarlo nuevamente desde tus pedidos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pedidos" className="bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors">
              Volver a mis pedidos
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
