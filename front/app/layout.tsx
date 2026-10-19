import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Providers } from "@/components/Providers";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: { default: "Ser Natural", template: "%s | Ser Natural" },
  description: "Ser Natural — Productos naturales y saludables para tu negocio.",
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
