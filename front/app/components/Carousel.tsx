// app/components/Carousel.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

// Definimos la interfaz para las propiedades del carrusel
interface CarouselProps {
  slides: {
    image: string;
    alt: string;
    title?: string;
    description?: string;
  }[];
  autoPlayInterval?: number;
}

export default function Carousel({ slides, autoPlayInterval = 5000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Función para navegar a la siguiente diapositiva
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, [slides.length]);

  // Función para navegar a la diapositiva anterior
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  }, [slides.length]);

  // Configurar la reproducción automática
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isAutoPlaying, nextSlide, autoPlayInterval]);

  // Pausar la reproducción automática cuando el usuario interactúa
  const handlePause = () => setIsAutoPlaying(false);
  const handleResume = () => setIsAutoPlaying(true);

  return (
    <div 
      className="relative w-full h-[500px] overflow-hidden rounded-lg bg-gray-50" 
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
    >
      {/* Contenedor de diapositivas */}
      <div 
        className="h-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />
            
            {/* Overlay con texto */}
            {(slide.title || slide.description) && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-8 text-white">
                {slide.title && (
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                )}
                {slide.description && (
                  <p className="text-lg md:text-xl max-w-2xl">{slide.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botones de navegación */}
      <button
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 p-2 rounded-full transition-colors"
        onClick={prevSlide}
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 p-2 rounded-full transition-colors"
        onClick={nextSlide}
        aria-label="Siguiente"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Indicadores de posición */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentIndex === index ? "bg-white" : "bg-white bg-opacity-50"
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir a diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}