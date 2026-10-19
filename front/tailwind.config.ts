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
        // Paleta Ser Natural — manual de marca 2024
        brand: {
          DEFAULT: "#7FAA33", // verde corporativo (pleno 1)
          dark:    "#5C8020", // verde oscuro (hover/contraste)
          darker:  "#2C4A10", // verde muy oscuro (texto en inputs)
          light:   "#EAF3CF", // verde muy claro (fondos)
        },
        accent: {
          DEFAULT: "#EEDF38", // amarillo corporativo (pleno 2)
          dark:    "#C9BB20", // amarillo oscuro (hover)
        },
        surface: "var(--surface)",
        subtle:  "var(--bg-subtle)",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.1)",
        drawer: "-4px 0 24px rgb(0 0 0 / 0.12)",
      },
      transitionTimingFunction: {
        drawer: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
} satisfies Config;
