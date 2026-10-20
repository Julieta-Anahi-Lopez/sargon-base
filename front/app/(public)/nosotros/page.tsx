import { Store, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Wave } from "@/components/ui/Wave";
import { CLIENTE } from "@/lib/config";

// Actualizar estos valores para que coincidan con brand, brand-dark y brand-light
// definidos en tailwind.config.ts
const C_BRAND_LIGHT = "#EAF3CF";
const C_WHITE       = "#ffffff";
const C_BRAND       = "#7FAA33";
const C_BRAND_DARK  = "#5C8020";

const STATS: {
  icon?: React.ComponentType<{ size: number; className: string }>;
  logo?: boolean;
  titulo: string;
  desc: string;
}[] = [
  {
    logo: true,
    titulo: "Lorem ipsum dolor",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam purus.",
  },
  {
    icon: Store,
    titulo: "Lorem ipsum dolor",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam purus.",
  },
  {
    icon: Users,
    titulo: "Lorem ipsum dolor",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam purus sit.",
  },
];


export default function NosotrosPage() {
  return (
    <div className="flex flex-col relative">

      {/* ── HERO NOSOTROS ────────────────────────────────────────────────── */}
      <section className="relative bg-brand-light pt-20 pb-28 px-6 text-center overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-black text-brand mb-3">
            ¡Nosotros!
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-brand-dark/80">
            ¿Quiénes somos?
          </p>
        </div>
        <Wave fill={C_WHITE} />
      </section>

      {/* ── QUIÉNES SOMOS ───────────────────────────────────────────────── */}
      <section className="relative bg-white pt-16 pb-28 px-6 overflow-hidden">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          <div className="flex flex-col sm:flex-row gap-8">
            <div className="flex-1">
              <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">Lorem ipsum</span>
              <p className="text-brand-dark text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.
              </p>
            </div>
            <div className="flex-1">
              <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">Lorem ipsum</span>
              <p className="text-brand-dark text-sm leading-relaxed">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
                rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
                explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur.
              </p>
            </div>
          </div>

          {/* Callout */}
          <div className="rounded-2xl bg-brand-light border-l-4 border-accent px-6 py-5">
            <p className="text-brand font-semibold text-base leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua —{" "}
              <span className="text-brand font-black">lorem ipsum</span>{" "}
              — ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
            </p>
          </div>

        </div>
        <Wave fill={C_BRAND_LIGHT} flip />
      </section>

      {/* ── TRES COLUMNAS ────────────────────────────────────────────────── */}
      <section className="relative bg-brand-light pt-16 pb-28 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {STATS.map(({ icon: Icon, logo, titulo, desc }) => (
            <div key={titulo} className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {logo ? (
                  <Image src="/images/logo.png" alt={CLIENTE.nombre} width={1752} height={2012} className="h-10 w-auto" />
                ) : Icon ? (
                  <Icon size={26} className="text-brand" />
                ) : null}
              </div>
              <h3 className="font-bold text-brand text-base leading-snug">{titulo}</h3>
              <p className="text-brand-dark/80 text-sm leading-relaxed">{desc}</p>
              <Link href="/catalogo" className="text-brand text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Ver más <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
        <Wave fill={C_BRAND} />
      </section>

      {/* ── SECCIÓN DESTACADA ────────────────────────────────────────────── */}
      <section className="relative bg-brand pt-16 pb-4 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">

          {/* Texto */}
          <div className="flex-1 text-center lg:text-left">
            <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">
              {CLIENTE.nombre}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Lorem ipsum<br />
              <span className="text-accent">dolor sit</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis.
            </p>
          </div>

          <div className="flex-1 w-full">
            <div className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden">
              <Image src="/images/deposito-panoramica.jpg" alt={`Depósito ${CLIENTE.nombre}`} fill className="object-cover object-[center_80%] scale-125" />
            </div>
          </div>

        </div>
      </section>

      {/* ── FOTO CIERRE ──────────────────────────────────────────────────── */}
      {/* Sin onda en UN NEGOCIO SALUDABLE: la transición la maneja la onda superior de esta sección */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden -mt-px pt-20 sm:pt-28 pb-20 sm:pb-28">
        {/* Imagen a color puro */}
        <Image src="/images/suplementos.jpg" alt={`Productos ${CLIENTE.nombre}`} fill className="object-cover object-center" />
        {/* Overlay oscuro central para legibilidad del texto */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Onda superior — imagen llega hasta acá (fill = color de la sección anterior bg-brand) */}
        <Wave fill={C_BRAND} top />
        {/* Onda inferior → transición directa al brand-dark del footer */}
        <Wave fill={C_BRAND_DARK} />

        <div className="relative z-10 text-center px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            {CLIENTE.eslogan}
          </h2>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-7 py-3.5 rounded-lg transition-colors"
          >
            Conocé nuestros productos <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
