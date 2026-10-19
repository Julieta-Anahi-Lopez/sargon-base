import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, CreditCard, ShoppingBag, MessageCircle } from "lucide-react";
import { Wave } from "@/components/ui/Wave";
import { LeafScatter } from "@/components/ui/LeafScatter";
import { CLIENTE, WHATSAPP } from "@/lib/config";

// Colores de fondo de cada sección — usados por las ondas
const C_WHITE = "#ffffff";
const C_DARK  = "#5C8020"; // brand-dark (footer)

const FEATURES = [
  { icon: Truck,        label: "Reparto sin cargo", desc: "Entregamos en Bahía Blanca sin costo adicional." },
  { icon: CreditCard,   label: "Pagá con tarjeta", desc: "Aceptamos todas las tarjetas de crédito y débito." },
  { icon: ShoppingBag,  label: "Mínimo de compra", desc: "Consultá el mínimo vigente con tu vendedor." },
];


export default function HomePage() {
  return (
    <div className="flex flex-col relative">
      <LeafScatter />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-light pb-20 min-h-[600px]">

        {/* Imagen — absolute sobre la sección completa (incluyendo área de onda) */}
        <div className="hidden lg:block lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-3/5">
          <Image src="/images/hero.jpg" alt={`Productos ${CLIENTE.nombre}`} fill className="object-cover object-center" priority />
          {/* Gradiente izquierdo → transición suave hacia el texto */}
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-brand-light to-transparent" />
        </div>

        {/* Texto — centrado verticalmente en la mitad izquierda */}
        <div className="flex min-h-[600px]">
          <div className="flex items-center w-full lg:w-2/5 px-6 lg:px-12 xl:px-20 py-24">
            <div>
              <span className="block text-brand text-xs font-bold uppercase tracking-widest mb-4">
                {CLIENTE.nombre} · Productos saludables
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-brand leading-none mb-6">
                ¡Los mejores<br />
                <span className="text-accent">productos</span><br />
                naturales!
              </h1>
              <p className="text-brand-dark text-lg max-w-sm leading-relaxed mb-10">
                ¡Todo lo saludable que necesitas para tu negocio! Siempre tratando de ofrecer lo mejor al mejor precio.
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
        </div>

        {/* Onda → bienvenida blanca */}
        <Wave fill={C_WHITE} />
      </section>

      {/* ── BIENVENIDA ────────────────────────────────────────────────────── */}
      {/* Sin onda inferior: la transición la maneja la onda superior de la sección siguiente */}
      <section className="relative bg-white -mt-px pt-6 pb-4 px-6 text-center">
        <h2 className="text-2xl font-bold text-brand mb-2">¡Bienvenidos a {CLIENTE.nombre}!</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-6 max-w-3xl mx-auto">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center">
                <Icon size={22} className="text-brand" />
              </div>
              <p className="font-bold text-brand text-sm">{label}</p>
              <p className="text-brand-dark/80 text-xs leading-relaxed text-center">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN OSCURA — Estamos para ayudarte a que tu negocio crezca ── */}
      <section className="relative min-h-[580px] flex items-center overflow-hidden -mt-px pt-20 sm:pt-28 pb-20 sm:pb-28">

        {/* Imagen a full — se extiende hasta los bordes superior e inferior (onda arriba y onda abajo) */}
        <Image src="/images/deposito-pasillo.jpg" alt={`Depósito ${CLIENTE.nombre}`} fill className="object-cover object-center" />
        {/* Degradado oscuro sobre el lado derecho para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent" />

        {/* Onda superior — mismo patrón que la onda inferior del hero:
            la imagen llega hasta acá y la onda (posterior en DOM) se renderiza encima */}
        <Wave fill={C_WHITE} top />

        <div className="relative z-10 w-full flex justify-end py-8">
          <div className="w-full lg:w-2/5 px-6 lg:px-12 xl:px-20 text-center lg:text-right">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              ¡Productos de origen<br />
              <span className="text-accent">directo</span> a tu comercio!
            </h2>
            <div className="flex justify-center lg:justify-end mt-8">
              <Link href="/catalogo" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-brand-dark font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Conocé nuestros productos <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Onda → newsletter blanca */}
        <Wave fill={C_WHITE} />
      </section>

      {/* ── CTA WHATSAPP ──────────────────────────────────────────────────── */}
      <section className="relative bg-white -mt-px pt-8 pb-6 px-6 text-center">
        <h2 className="text-2xl font-bold text-brand mb-2">
          ¡No te quedés con dudas!
        </h2>
        <p className="text-brand-dark/80 text-sm max-w-md mx-auto mb-6">
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

      {/* ── SEGUNDA SECCIÓN HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-[580px] flex items-center overflow-hidden -mt-px pt-20 sm:pt-28 pb-20 sm:pb-28">

        {/* Imagen a full color */}
        <Image src="/images/productos-detalle.jpg" alt={`Productos ${CLIENTE.nombre}`} fill className="object-cover object-center" />
        {/* Degradado oscuro sobre el lado izquierdo para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        {/* Onda superior — imagen llega hasta acá */}
        <Wave fill={C_WHITE} top />
        {/* Onda inferior → transición directa al brand-dark del footer */}
        <Wave fill={C_DARK} />

        <div className="relative z-10 w-full flex justify-start py-8">
          <div className="w-full lg:w-2/5 px-6 lg:px-12 xl:px-20 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              ¡La más amplia<br />
              <span className="text-accent">variedad</span> de<br />
              productos!
            </h2>
            <p className="text-white/80 text-base max-w-md mt-4 leading-relaxed">
              Para que tu comercio sea un punto de abastecimiento completo para tus clientes.
            </p>
            <div className="flex justify-center lg:justify-start mt-8">
              <Link href="/catalogo" className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Ver catálogo <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
