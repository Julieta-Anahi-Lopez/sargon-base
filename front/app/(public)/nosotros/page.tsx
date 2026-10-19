import { Store, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Wave } from "@/components/ui/Wave";
import { LeafScatter } from "@/components/ui/LeafScatter";

const C_LIME  = "#EAF3CF"; // brand-light
const C_WHITE = "#ffffff";
const C_GREEN = "#7FAA33"; // brand
const C_DARK  = "#5C8020"; // brand-dark (footer)

const STATS: {
  icon?: React.ComponentType<{ size: number; className: string }>;
  logo?: boolean;
  titulo: string;
  desc: string;
}[] = [
  {
    logo: true,
    titulo: "Variedad y precio",
    desc: "Amplia diversidad de productos para que puedas elegir al mejor precio.",
  },
  {
    icon: Store,
    titulo: "Amplia cobertura",
    desc: "Abastecemos centro de la provincia de Buenos Aires y sur del país.",
  },
  {
    icon: Users,
    titulo: "Atención personalizada",
    desc: "¿Necesitás abrir tu negocio? En nuestro rubro somos especialistas en asesoramiento. ¡Consultanos!",
  },
];


export default function NosotrosPage() {
  return (
    <div className="flex flex-col relative">
      <LeafScatter />

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
              <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">Nuestro origen</span>
              <p className="text-brand-dark text-sm leading-relaxed">
                Ser Natural es un concepto que surge a partir de la necesidad de brindar a los comercios opciones y
                alternativas para personas con celiaquía. Con ese propósito fuimos los primeros en traer a nuestra
                localidad una alternativa de alfajores pensada para este público, siendo una solución a un público que
                en aquella época —ya más de una década— buscaba una opción saludable.
              </p>
            </div>
            <div className="flex-1">
              <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">Hoy</span>
              <p className="text-brand-dark text-sm leading-relaxed">
                Hoy podemos decir con mucho orgullo que nuestra empresa familiar, ya convertida en una Distribuidora y
                Autoservicio Mayorista referente en nuestra área, cuenta con una gama infinitamente más amplia de
                productos orientados a la alimentación saludable: celiaquía, diabetes, intolerancia a la lactosa,
                naturismo, veganismo, vegetarianismo, low carb/keto y más.
              </p>
            </div>
          </div>

          {/* Callout — la impronta */}
          <div className="rounded-2xl bg-brand-light border-l-4 border-accent px-6 py-5">
            <p className="text-brand font-semibold text-base leading-relaxed">
              Siempre es y será nuestra impronta y objetivo brindar, más allá del producto, una atención y un servicio
              ejemplar a nuestros clientes —{" "}
              <span className="text-brand font-black">los comerciantes</span>{" "}
              — ayudándolos, asesorándolos y brindándoles herramientas para su crecimiento dentro de este rubro.
            </p>
          </div>

        </div>
        <Wave fill={C_LIME} flip />
      </section>

      {/* ── TRES COLUMNAS ────────────────────────────────────────────────── */}
      <section className="relative bg-brand-light pt-16 pb-28 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {STATS.map(({ icon: Icon, logo, titulo, desc }) => (
            <div key={titulo} className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {logo ? (
                  <Image src="/images/logo.png" alt="Ser Natural" width={1752} height={2012} className="h-10 w-auto" />
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
        <Wave fill={C_GREEN} />
      </section>

      {/* ── UN NEGOCIO SALUDABLE ─────────────────────────────────────────── */}
      <section className="relative bg-brand pt-16 pb-4 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">

          {/* Texto */}
          <div className="flex-1 text-center lg:text-left">
            <span className="block text-accent text-xs font-bold uppercase tracking-widest mb-3">
              Ser Natural
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Un negocio<br />
              <span className="text-accent">saludable</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              Más de 12 años siendo natural. Desde nuestros comienzos, apostamos por un modelo de negocio basado en la salud, la calidad y el compromiso con nuestros clientes.
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              Nuestra misión es acercar los mejores productos naturales a cada punto de venta, acompañando el crecimiento de nuestros distribuidores con herramientas, precios y atención de primer nivel.
            </p>
          </div>

          <div className="flex-1 w-full">
            <div className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden">
              <Image src="/images/deposito-panoramica.jpg" alt="Depósito Ser Natural" fill className="object-cover object-[center_80%] scale-125" />
            </div>
          </div>

        </div>
      </section>

      {/* ── FOTO CIERRE ──────────────────────────────────────────────────── */}
      {/* Sin onda en UN NEGOCIO SALUDABLE: la transición la maneja la onda superior de esta sección */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden -mt-px pt-20 sm:pt-28 pb-20 sm:pb-28">
        {/* Imagen a color puro */}
        <Image src="/images/suplementos.jpg" alt="Productos Ser Natural" fill className="object-cover object-center" />
        {/* Overlay oscuro central para legibilidad del texto */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Onda superior — imagen llega hasta acá (fill = color de la sección anterior bg-brand) */}
        <Wave fill={C_GREEN} top />
        {/* Onda inferior → transición directa al brand-dark del footer */}
        <Wave fill={C_DARK} />

        <div className="relative z-10 text-center px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            ¡Estamos para ayudarte a que tu negocio crezca!
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
