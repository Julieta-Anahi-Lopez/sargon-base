"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

interface ScrollToTopProps {
  threshold?: number; // Píxeles de scroll antes de mostrar el botón
}

export default function ScrollToTop({ threshold = 400 }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-20 left-4 z-50
        w-11 h-11 rounded-full
        bg-amber-600 text-white
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        hover:bg-amber-700
        transition-all duration-300
        ${isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
        }
      `}
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <ChevronUp size={24} />
    </button>
  );
}
