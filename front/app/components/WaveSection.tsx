"use client";

import React from "react";

interface WaveSectionProps {
  children: React.ReactNode;
  className?: string;
  bgStyle?: string;
}

export default function WaveSection({
  children,
  className = "",
  bgStyle = "bg-gray/50 backdrop-blur-md",
}: WaveSectionProps) {
  return (
    <section className={`relative overflow-hidden ${bgStyle} ${className}`}>
      {/* Wave superior
      <div className="absolute top-0 left-0 w-full z-0 hidden lg:block">
        <svg viewBox="0 0 1440 320" className="w-full h-32" preserveAspectRatio="none">
          <path
            fill="rgba(255, 255, 255, 0.5)"
            d="M0,160L60,144C120,128,240,96,360,85.3C480,75,600,85,720,112C840,139,960,181,1080,176C1200,171,1320,117,1380,90.7L1440,64V0H0Z"
          />
        </svg>
      </div> */}

      {/* Contenido principal */}
      <div
        className="relative z-10 container mx-auto px-4 py-16"
        style={{
          maskImage: 'radial-gradient(circle at 50% 0%, black 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 70%, transparent 100%)',
        }}
      >
        {children}
      </div>
{/* 
      Wave inferior invertida
      <div className="absolute bottom-0 left-0 w-full z-0 hidden lg:block rotate-180">
        <svg viewBox="0 0 1440 320" className="w-full h-32" preserveAspectRatio="none">
          <path
            fill="rgba(255, 255, 255, 0.5)"
            d="M0,160L60,144C120,128,240,96,360,85.3C480,75,600,85,720,112C840,139,960,181,1080,176C1200,171,1320,117,1380,90.7L1440,64V0H0Z"
          />
        </svg>
      </div> */}
    </section>
  );
}













// // app/components/WaveSection.tsx
// "use client";

// import React from "react";

// interface WaveSectionProps {
//   children: React.ReactNode;
//   className?: string;
//   bgStyle?: string;
// }

// export default function WaveSection({
//   children,
//   className = "",
//   bgStyle = "bg-transparent",
// }: WaveSectionProps) {
//   return (
//     <section className={`relative overflow-hidden ${bgStyle} ${className}`}>
//       {/* SVG Waves como fondo decorativo */}
//       <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block">
//         <svg
//           className="w-full h-full"
//           viewBox="0 0 1440 320"
//           preserveAspectRatio="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <defs>
//             <linearGradient id="waveGradient" gradientTransform="rotate(90)">
//               <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
//               <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
//             </linearGradient>
//           </defs>
//           <path
//             fill="url(#waveGradient)"
//             d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,218.7C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320H0Z"
//           />
//         </svg>
//       </div>

//       {/* Contenido */}
//       <div className="relative z-10 container mx-auto px-4 py-10">
//         {children}
//       </div>
//     </section>
//   );
// }


// // app/components/WaveSection.tsx (con SVG)
// "use client";

// import React from "react";

// interface WaveSectionProps {
//   children: React.ReactNode;
//   className?: string;
//   bgColor?: string;
// }

// export default function WaveSection({ 
//   children, 
//   className = "", 
//   bgColor = "bg-blue-900"
// }: WaveSectionProps) {
//   return (
//     <section className={`relative ${bgColor} ${className} overflow-hidden`}>
//       {/* SVG waves background - solo visible en lg y superior */}
//       <div className="absolute inset-0 w-full h-full z-0 hidden lg:block">
//         <svg
//           className="absolute w-full h-full"
//           xmlns="http://www.w3.org/2000/svg"
//           xmlnsXlink="http://www.w3.org/1999/xlink"
//           viewBox="0 0 1440 320"
//           preserveAspectRatio="none"
//           style={{ width: "100%", height: "100%", position: "absolute" }}
//         >
//           <path
//             fill="rgba(255, 255, 255, 0.1)"
//             d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,218.7C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
//           />
//           <path
//             fill="rgba(255, 255, 255, 0.15)"
//             d="M0,96L48,128C96,160,192,224,288,218.7C384,213,480,139,576,122.7C672,107,768,149,864,181.3C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
//           />
//         </svg>
//       </div>
      
//       <div className="relative z-10 container mx-auto px-4 py-10">
//         {children}
//       </div>
//     </section>
//   );
// }