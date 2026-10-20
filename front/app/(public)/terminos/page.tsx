import Link from "next/link";
import { FileText, ArrowLeft, ScrollText, Copyright, Globe, Lock } from "lucide-react";
import { CLIENTE } from "@/lib/config";

export default function TerminosCondiciones() {
  return (
    <main className="min-h-screen bg-brand-light/30">

      {/* Hero */}
      <div className="bg-brand pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Términos y Condiciones</h1>
              <p className="text-white/60 mt-1 text-sm">Condiciones de uso de nuestro sitio web</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-brand/10 overflow-hidden divide-y divide-brand/10">

          <Section icon={<ScrollText className="w-5 h-5 text-brand" />} title="Condiciones de Uso">
            <p>El acceso y uso de este Sitio Web se rige por las presentes condiciones de uso. Al acceder, navegar y utilizar nuestro
              Sitio Web usted reconoce que ha leído, entendido y aceptado, sin reservas, estas Condiciones de Uso, con las modificaciones
              que podamos realizar en el futuro.</p>
            <p>Si hubiese alguna modificación en nuestras Condiciones de Uso, publicaremos una nueva versión en nuestro Sitio Web.
              Le sugerimos consultar estas Condiciones de Uso con regularidad a los efectos de mantenerse actualizado al respecto.</p>
          </Section>

          <Section icon={<Copyright className="w-5 h-5 text-brand" />} title="Derecho de Autor y Propiedad Intelectual" alt>
            <p>El contenido del Sitio Web, así como los textos, marcas, logos, fotografías, videos, música, diseños y productos
              son de uso exclusivo de {CLIENTE.nombre} y en consecuencia están protegidos por derechos de autor, marcas, patentes y otros
              derechos de propiedad intelectual o industrial existentes bajo la legislación aplicable.</p>
          </Section>

          <Section icon={<Globe className="w-5 h-5 text-brand" />} title="El Uso del Sitio Web">
            <p>Usted puede descargar, visualizar o imprimir el contenido de nuestro Sitio Web exclusivamente para uso personal y no
              comercial. Cualquier otro uso, incluyendo la reproducción, modificación, transmisión o difusión del contenido, en todo
              o en parte y por cualquier medio, está estrictamente prohibido, salvo consentimiento previo por escrito de {CLIENTE.nombre}.</p>
          </Section>

          <Section icon={<Lock className="w-5 h-5 text-brand" />} title="Información Considerada No Confidencial" alt>
            <p>Los datos e información de identificación personal que usted proporcione a través de nuestro Sitio Web están protegidos
              y tratados de acuerdo a nuestra{" "}
              <Link href="/politica-privacidad" className="text-brand underline hover:text-brand-dark">
                Política de Privacidad
              </Link>
              . Le invitamos a leerla atentamente antes de proveernos con tales datos.</p>
            <p>Cualquier otra información o material remitido a {CLIENTE.nombre} a través de Internet, por correo electrónico o de otra manera,
              incluyendo datos, preguntas, comentarios o sugerencias, son y serán tratados como no confidenciales.</p>
          </Section>

        </div>

        <p className="mt-8 text-center text-gray-400 text-xs">Última actualización: Enero 2025</p>
      </div>
    </main>
  );
}

function Section({ icon, title, children, alt = false }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <div className={`p-6 md:p-8 flex items-start gap-4 ${alt ? "bg-brand-light/20" : ""}`}>
      <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center shrink-0">{icon}</div>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand">{title}</h2>
        <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}
