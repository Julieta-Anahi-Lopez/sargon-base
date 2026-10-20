import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /*
         * ── PALETA DEL CLIENTE ──────────────────────────────────────────────
         * Reemplazá estos valores al crear un nuevo cliente.
         * Ver NUEVO_CLIENTE.md para la guía completa.
         *
         * brand   → color primario (encabezados, botones principales, fondos de sección)
         * accent  → color de acento (CTAs, highlights, botones secundarios)
         *
         * Convención de variantes:
         *   DEFAULT  → el tono "base" del color
         *   dark     → más oscuro (hover, header)
         *   darker   → el más oscuro (texto sobre fondos claros)
         *   light    → muy claro (fondos de sección, bg alternados)
         * ───────────────────────────────────────────────────────────────────
         */
        brand: {
          DEFAULT: "#3B82F6", // azul — reemplazar por color primario del cliente
          dark:    "#2563EB", // azul oscuro
          darker:  "#1E3A8A", // azul muy oscuro (texto en fondos claros)
          light:   "#EFF6FF", // azul muy claro (fondos de sección)
        },
        accent: {
          DEFAULT: "#F59E0B", // ámbar — reemplazar por acento del cliente
          dark:    "#D97706", // ámbar oscuro (hover)
        },
        surface: "var(--surface)",
        subtle:  "var(--bg-subtle)",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:       "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-hover":"0 4px 12px 0 rgb(0 0 0 / 0.1)",
        drawer:     "-4px 0 24px rgb(0 0 0 / 0.12)",
      },
      transitionTimingFunction: {
        drawer: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
} satisfies Config;
