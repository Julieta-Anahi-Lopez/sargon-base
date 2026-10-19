import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/components/Providers";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import { CLIENTE } from "@/lib/config";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: { default: CLIENTE.seo.titulo, template: `%s | ${CLIENTE.seo.titulo}` },
  description: CLIENTE.seo.descripcion,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} antialiased`}>
        <Providers>{children}</Providers>
        <WhatsAppFloat />
      </body>
    </html>
  );
}
