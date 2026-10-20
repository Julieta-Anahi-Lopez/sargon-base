import { Store, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CLIENTE } from "@/lib/config";

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
    <div className="flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-light py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="block text-brand text-xs font-bold uppercase tracking-widest mb-4">
            {CLIENTE.nombre}
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-brand mb-4">
            Nosotros
          </h1>
          <p className="text-xl font-semibold text-gray-500">
            ¿Quiénes somos?
          </p>
        </div>
      </section>

      {/* ── QUIÉNES SOMOS ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          <div className="flex flex-col sm:flex-row gap-10">
            <div className="flex-1">
              <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">
                Lorem ipsum
              </span>
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
            <div className="flex-1">
              <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">
                Lorem ipsum
              </span>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore
                veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
          </div>

          {/* Callout */}
          <div className="rounded-2xl bg-brand-light border-l-4 border-accent px-6 py-5">
            <p className="text-brand font-semibold text-base leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua —{" "}
              <span className="font-black">lorem ipsum</span>{" "}
              — ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>

        </div>
      </section>

      {/* ── TRES COLUMNAS ────────────────────────────────────────────────── */}
      <section className="bg-brand-light py-20 px-6 border-t border-brand/10">
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
              <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              <Link href="/catalogo" className="text-brand text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Ver más <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN DESTACADA ────────────────────────────────────────────── */}
      <section className="bg-brand py-20 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="block text-brand-light/70 text-xs font-bold uppercase tracking-widest mb-3">
              {CLIENTE.nombre}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">
              Lorem ipsum<br />
              <span className="text-brand-light">dolor sit</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud.
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
              doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore.
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="relative w-full h-72 lg:h-88 rounded-2xl overflow-hidden">
              <Image
                src="/images/deposito-panoramica.jpg"
                alt={`Depósito ${CLIENTE.nombre}`}
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOTO CIERRE ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[480px] flex items-center overflow-hidden">
        <Image
          src="/images/suplementos.jpg"
          alt={`Productos ${CLIENTE.nombre}`}
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full text-center px-6 py-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
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
