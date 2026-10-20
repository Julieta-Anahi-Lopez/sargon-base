import Link from "next/link";
import Image from "next/image";
import { Mail, Instagram, MessageCircle, MapPin } from "lucide-react";

import { CLIENTE } from "@/lib/config";
const { contacto, whatsapp: wa, nombre, eslogan } = CLIENTE;

const LINKS = [
  { href: "/politica-privacidad", label: "Política de privacidad" },
  { href: "/terminos",            label: "Términos y condiciones" },
  { href: "/terminos",            label: "Defensa al consumidor" },
];

const SOCIAL = [
  {
    label: "Email",
    icon: Mail,
    href: `mailto:${contacto.email}`,
  },
  {
    label: "Instagram",
    icon: Instagram,
    href: `https://instagram.com/${contacto.instagram}`,
  },
  {
    label: "WhatsApp",
    icon: MessageCircle,
    href: `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(wa.mensajeFooter)}`,
  },
  {
    label: "Ubicación",
    icon: MapPin,
    href: contacto.mapsUrl,
  },
];

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white border-t-4 border-brand">
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pt-12 pb-10 flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/logo.png"
            alt={nombre}
            width={1752}
            height={2012}
            className="h-20 w-auto"
          />
          <p className="text-white/50 text-xs italic">{eslogan}</p>
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
          © {new Date().getFullYear()} {nombre}. Todos los derechos reservados.
        </p>

      </div>
    </footer>
  );
}
