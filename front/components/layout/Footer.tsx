import Link from "next/link";
import Image from "next/image";
import { Mail, Instagram, MessageCircle, MapPin } from "lucide-react";

import { WHATSAPP } from "@/lib/config";
const LINKS = [
  { href: "/politica-privacidad", label: "Política de privacidad" },
  { href: "/terminos",            label: "Términos y condiciones" },
  { href: "/terminos",            label: "Defensa al consumidor" },
];

const SOCIAL = [
  {
    label: "Email",
    icon: Mail,
    href: "mailto:sernaturaldistribuidora@gmail.com",
  },
{
    label: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/distribuidora.sernatural",
  },
  {
    label: "WhatsApp",
    icon: MessageCircle,
    href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola, quiero consultar sobre productos de Ser Natural")}`,
  },
  {
    label: "Ubicación",
    icon: MapPin,
    href: "https://www.google.com/maps/search/Saavedra+1647+Bahia+Blanca",
  },
];

export function Footer() {
  return (
    <footer className="relative bg-brand-dark text-white -mt-px">
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pt-12 pb-10 flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Ser Natural"
            width={1752}
            height={2012}
            className="h-20 w-auto"
          />
          <p className="text-white/50 text-xs italic">¡Estamos para ayudarte a que tu negocio crezca!</p>
        </div>

        {/* Redes sociales */}
        <div className="flex items-center gap-4">
          {SOCIAL.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center text-white/80 hover:text-accent hover:border-accent transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        {/* Enlaces de interés */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-accent font-bold text-sm uppercase tracking-widest">
            Enlaces de interés
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-white/60 text-xs hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} Ser Natural. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}
