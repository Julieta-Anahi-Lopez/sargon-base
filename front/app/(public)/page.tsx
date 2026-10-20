import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, CreditCard, ShoppingBag, MessageCircle } from "lucide-react";
import { CLIENTE, WHATSAPP } from "@/lib/config";

const FEATURES = [
  { icon: Truck,        label: "Reparto sin cargo", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { icon: CreditCard,   label: "Pagá con tarjeta",  desc: "Aceptamos todas las tarjetas de crédito y débito." },
  { icon: ShoppingBag,  label: "Mínimo de compra",  desc: "Consultá el mínimo vigente con tu vendedor." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="min-h-[600px] flex items-stretch bg-brand-light">
        {/* Texto */}
        <div className="flex items-center w-full lg:w-2/5 px-8 lg:px-14 xl:px-20 py-20">
          <div>
            <span className="block text-brand text-xs font-bold uppercase tracking-widest mb-5">
              {CLIENTE.nombre}
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-brand leading-none mb-6">
              Lorem ipsum<br />
              <span className="text-accent">dolor sit</span><br />
              amet.
            </h1>
            <p className="text-gray-600 text-lg max-w-sm leading-relaxed mb-10">
              {CLIENTE.descripcion}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Ver catálogo <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 border-2 border-brand hover:bg-brand text-brand hover:text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Ingresar
              </Link>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="hidden lg:block lg:w-3/5 relative">
          <Image
            src="/images/hero.jpg"
            alt={`Productos ${CLIENTE.nombre}`}
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-brand mb-12">
            ¡Bienvenidos a {CLIENTE.nombre}!
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center">
                  <Icon size={22} className="text-brand" />
                </div>
                <p className="font-bold text-brand text-sm">{label}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMAGEN STATEMENT 1 ────────────────────────────────────────────── */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden">
        <Image
          src="/images/deposito-pasillo.jpg"
          alt={`Depósito ${CLIENTE.nombre}`}
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/65 via-black/25 to-transparent" />
        <div className="relative z-10 w-full flex justify-end py-12">
          <div className="w-full lg:w-2/5 px-8 lg:px-14 xl:px-20 text-center lg:text-right">
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              ¡Productos de origen<br />
              <span className="text-accent">directo</span> a tu comercio!
            </h2>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-brand-darker font-semibold px-7 py-3.5 rounded-lg transition-colors"
            >
              Conocé nuestros productos <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA WHATSAPP ──────────────────────────────────────────────────── */}
      <section className="bg-brand-light py-16 px-6 text-center border-t border-brand/10">
        <h2 className="text-2xl font-bold text-brand mb-3">
          ¡No te quedés con dudas!
        </h2>
        <p className="text-gray-600 text-sm max-w-md mx-auto mb-8">
          Solicitá toda la información que necesitás. Estamos para ayudarte a que tu negocio sea el mejor del barrio.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(CLIENTE.whatsapp.mensajeFooter)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3 rounded-full transition-colors"
        >
          <MessageCircle size={18} />
          Consultanos por WhatsApp
        </a>
      </section>

      {/* ── IMAGEN STATEMENT 2 ────────────────────────────────────────────── */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden">
        <Image
          src="/images/productos-detalle.jpg"
          alt={`Productos ${CLIENTE.nombre}`}
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        <div className="relative z-10 w-full flex justify-start py-12">
          <div className="w-full lg:w-2/5 px-8 lg:px-14 xl:px-20 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              ¡La más amplia<br />
              <span className="text-accent">variedad</span> de<br />
              productos!
            </h2>
            <p className="text-white/80 text-base max-w-md mt-4 leading-relaxed">
              Para que tu comercio sea un punto de abastecimiento completo para tus clientes.
            </p>
            <div className="mt-8">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-lg transition-colors"
              >
                Ver catálogo <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
