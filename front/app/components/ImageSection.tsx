// app/components/ImageSection.tsx
"use client";

import Image from "next/image";

interface ImageSectionProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  imageOnRight?: boolean;
  height?: string;
  topWave?: boolean;
  bottomWave?: boolean;
  waveColor?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function ImageSection({
  imageSrc,
  imageAlt,
  title,
  description,
  imageOnRight = true,
  height = "h-[500px]",
  buttonText,
  buttonLink
}: ImageSectionProps) {
  return (
    <section className="relative w-full bg-gray-50 dark:bg-gray-900">
      {/* Onda superior (opcional) */}
      {/* {topWave && (
        <div className="absolute top-0 left-0 w-full overflow-hidden z-10 h-16">
          <svg
            className="absolute w-full"
            viewBox="0 0 1440 110" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%" }}
          >
            <path
              fill={waveColor}
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            ></path>
          </svg>
        </div>
      )} */}

      {/* Solo imagen en pantallas pequeñas y medianas */}
      <div className={`relative w-full ${height} block lg:hidden`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      {/* Contenedor dividido en pantallas grandes */}
      <div className={`hidden lg:flex flex-row ${imageOnRight ? '' : 'flex-row-reverse'} ${height}`}>
        {/* Sección de texto */}
        <div className="w-1/2 bg-gray-50 dark:bg-gray-900 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
          
          {buttonText && buttonLink && (
            <div>
              <a 
                href={buttonLink} 
                className="inline-block bg-amber-600 text-white font-medium py-2 px-6 rounded-md hover:bg-amber-700 transition-colors"
              >
                {buttonText}
              </a>
            </div>
          )}
        </div>
        
        {/* Sección de imagen */}
        <div
        className="w-1/2 relative overflow-hidden"
        style={{
          clipPath: imageOnRight
            ? 'polygon(0 0, 100% 0, 100% 100%, 10% 100%)'
            : 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)',
        }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-700 scale-[1.02] hover:scale-105"
          sizes="50vw"
          priority
        />
      </div>

      </div>

      {/* Onda inferior (opcional) */}
      {/* {bottomWave && (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10 h-16">
          <svg
            className="absolute w-full"
            viewBox="0 0 1440 110" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%" }}
          >
            <path
              fill={waveColor}
              fillOpacity="1"
              d="M0,32L80,42.7C160,53,320,75,480,69.3C640,64,800,32,960,21.3C1120,11,1280,21,1360,26.7L1440,32L1440,110L1360,110C1280,110,1120,110,960,110C800,110,640,110,480,110C320,110,160,110,80,110L0,110Z"
            ></path>
          </svg>
        </div>
      )} */}
    </section>
  );
}