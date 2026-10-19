// app/components/WhatsAppButton.tsx
"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

export default function WhatsAppButton({ 
  phoneNumber, 
  message = "Hola, me gustaría obtener más información" 
}: WhatsAppButtonProps) {
  // Estado para controlar si el mensaje promocional está visible
  const [isPromoVisible, setIsPromoVisible] = useState(false);
  
  // Formatear el número de teléfono
  const formattedNumber = phoneNumber.replace(/\D/g, "");
  
  // Crear la URL de WhatsApp
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  
  // Efecto para mostrar y ocultar automáticamente el mensaje promocional
  useEffect(() => {
    // Mostrar el mensaje después de un segundo
    const showTimeout = setTimeout(() => {
      setIsPromoVisible(true);
    }, 1000);
    
    // Ocultar el mensaje después de 4 segundos en total
    const hideTimeout = setTimeout(() => {
      setIsPromoVisible(false);
    }, 4000);
    
    // Limpiar timeouts cuando el componente se desmonte
    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Mensaje promocional con estilos inline */}
      {isPromoVisible && (
        <div 
          className="absolute bottom-full mb-3 right-0 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md text-sm font-medium whitespace-nowrap"
          style={{
            animation: "0.3s ease-out forwards fadeIn, 0.3s ease-in 2.7s forwards fadeOut",
          }}
        >
          ¡Contactanos por WhatsApp!
          <div 
            className="absolute top-full right-5"
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white"
            }}
          ></div>
          
          {/* Estilos de animación definidos inline */}
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
              from { opacity: 1; transform: translateY(0); }
              to { opacity: 0; transform: translateY(10px); visibility: hidden; }
            }
          `}</style>
        </div>
      )}
      
      <Link 
        href={whatsappUrl} 
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors duration-300 group"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap">
          Envíanos un mensaje
        </span>
      </Link>
    </div>
  );
}