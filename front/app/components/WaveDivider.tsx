// app/components/WaveDivider.tsx
"use client";

import Image from "next/image";
import React from "react";

interface WaveDividerProps {
  color?: "blue" | "white" | "gray";
  flip?: boolean;
  className?: string;
}

export default function WaveDivider({ 
  color = "blue", 
  flip = false,
  className = ""
}: WaveDividerProps) {
  
  // Mapeo de colores a rutas de imágenes
  const waveSources = {
    blue: "/images/wave-blue.png",
    white: "/images/wave-white.png",
    gray: "/images/wave-gray.png",
  };

  // Selecciona la imagen basada en el color
  const imageSource = waveSources[color];
  
  return (
    <div className={`w-full ${className}`}>
      <Image
        src={imageSource}
        alt="Separador de ola"
        width={1920}
        height={120}
        className={`w-full ${flip ? 'transform rotate-180' : ''}`}
        priority
      />
    </div>
  );
}