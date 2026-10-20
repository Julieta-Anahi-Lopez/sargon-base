import Link from "next/link";
import { Shield, ArrowLeft, UserCheck, Database, Bell, Smartphone } from "lucide-react";
import { CLIENTE } from "@/lib/config";

export default function PoliticaPrivacidad() {
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
              <Shield className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
              <p className="text-white/60 mt-1 text-sm">Tu privacidad es importante para nosotros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-brand/10 overflow-hidden divide-y divide-brand/10">

          <Section icon={<UserCheck className="w-5 h-5 text-brand" />} title="Datos Personales">
            <p>Para poder utilizar este Sitio Web de manera eficiente y segura, los usuarios deberán aportar ciertos datos,
              entre ellos su nombre y apellido, domicilio y cuenta de e-mail, sin los cuales se tornaría imposible brindar los servicios.
              Por eso se requiere que éstos sean verdaderos y exactos.</p>
            <p>La información personal que los Usuarios ingresan es totalmente confidencial y {CLIENTE.nombre} hará su mejor esfuerzo
              para proteger la privacidad de los mismos, de conformidad con lo dispuesto en la Ley 25.326.</p>
          </Section>

          <Section icon={<Database className="w-5 h-5 text-brand" />} title="Derechos del Usuario" alt>
            <p>Los Usuarios tienen el derecho de acceder a la información de su cuenta y podrán modificar los datos ingresados cuando
              lo deseen. También podrán ejercer el derecho de rectificación y requerir en cualquier momento la baja de su solicitud
              y la eliminación de su cuenta de la base de datos.</p>
            <p>En caso de que los datos sean requeridos por vía legal, administrativa o judicial, {CLIENTE.nombre} se verá compelida
              a revelar los mismos a la autoridad solicitante.</p>
          </Section>

          <Section icon={<Bell className="w-5 h-5 text-brand" />} title="Comunicaciones">
            <p>Por el solo hecho de registrarse en este Sitio Web, los Usuarios aceptan que {CLIENTE.nombre} tiene derecho a comunicarse
              con ellos por vía postal, telefónica o electrónica y enviar información que considere de su interés. Los Usuarios
              podrán optar por no recibir estas comunicaciones.</p>
          </Section>

          <Section icon={<Smartphone className="w-5 h-5 text-brand" />} title="Información Técnica sobre Dispositivos" alt>
            <p>Si usted accede al Sitio Web de {CLIENTE.nombre} a través de un dispositivo móvil, la información recogida también incluirá
              el identificador único del dispositivo, ubicación geográfica y otros datos similares, cuando esté permitido.</p>
            <p>Mientras navega, usamos tecnologías de recogida automática de datos como cookies y servicios de analítica.
              Usted tiene el derecho de oponerse al uso de dichas tecnologías.</p>
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
