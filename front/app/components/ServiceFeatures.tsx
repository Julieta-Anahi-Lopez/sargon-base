"use client";

import { Truck, CreditCard, ShoppingBag } from "lucide-react";
import React from "react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex items-start gap-4 group transition-all">
      <div className="text-white transition-transform duration-300 ease-in-out group-hover:-translate-y-1 group-hover:rotate-1">
        {icon}
      </div>
      <div className="group-hover:translate-x-1 transition-transform duration-300 ease-in-out">
        <h3 className="text-xl font-bold text-white">
          {title}
        </h3>
        <p className="text-sm text-gray-200 group-hover:opacity-80 transition-opacity">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ServiceFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto px-4 py-2">
      <Feature
        icon={<Truck size={36} />}
        title="Envíos"
        description="A todo el país."
      />
      <Feature
        icon={<CreditCard size={36} />}
        title="Formas de Pago"
        description="Efectivo, transferencia, tarjeta, cheques."
      />
      <Feature
        icon={<ShoppingBag size={36} />}
        title="Mínimo de Compra"
        description="Monto mínimo de compra para todo el país $50.000"
      />
    </div>
  );
}




// // app/components/ServiceFeatures.tsx
// "use client";

// import { Truck, CreditCard, ShoppingBag } from "lucide-react";
// import React from "react";

// interface FeatureProps {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
// }

// function Feature({ icon, title, description }: FeatureProps) {
//   return (
//     <div className="flex items-center gap-4">
//       <div className="flex-shrink-0 text-blue-900">
//         {icon}
//       </div>
//       <div>
//         <h3 className="text-xl font-bold text-blue-900">{title}</h3>
//         <p className="text-blue-900 text-sm">{description}</p>
//       </div>
//     </div>
//   );
// }

// export default function ServiceFeatures() {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       <Feature
//         icon={<Truck size={36} />}
//         title="Envíos"
//         description="A todo el país."
//       />
//       <Feature
//         icon={<CreditCard size={36} />}
//         title="Formas de Pago"
//         description="Efectivo, transferencia, tarjeta, cheques."
//       />
//       <Feature
//         icon={<ShoppingBag size={36} />}
//         title="Mínimo de Compra"
//         description="Monto mínimo de compra para todo el país $50.000"
//       />
//     </div>
//   );
// }