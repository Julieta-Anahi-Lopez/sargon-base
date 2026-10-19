"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

interface Brand {
  name: string;
  logoUrl: string;
  width: number;
  nromar: number; // Identificador único de marca
}

export default function BrandLogos() {
  const router = useRouter();

  const brands: Brand[] = [
    { name: "MultiMax", logoUrl: "/images/logos/200px x 90 px MULTIMAX - ENCABEZADO.png", width: 140, nromar: 2 },
    { name: "Walker", logoUrl: "/images/logos/200px x 90 px WALKER - ENCABEZADO.png", width: 140, nromar: 6 },
    { name: "Hecspi", logoUrl: "/images/logos/200px x 90 px HECSPI - ENCABEZADO.png", width: 150, nromar: 5 }
  ];

  const handleClick = (nromar: number) => {
    router.push(`/catalogo?nromar=${nromar}`);
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
      {brands.map((brand) => (
        <button
          key={brand.name}
          onClick={() => handleClick(brand.nromar)}
          className="relative h-16 transition-transform hover:scale-105 focus:outline-none"
          style={{ width: `${brand.width}px` }}
          aria-label={`Filtrar por ${brand.name}`}
        >
          <Image
            src={brand.logoUrl}
            alt={`Logo ${brand.name}`}
            fill
            className="object-contain"
            //Agrego un hover para que  diga ver en el catalogo productos..
            title={`Ver productos de ${brand.name}`}
            
          />
        </button>
      ))}
    </div>
  );
}
