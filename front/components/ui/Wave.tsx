/**
 * Wave — separador SVG en S entre secciones.
 *
 * Uso normal: colocar al FINAL de una sección.
 * `fill`  → color de fondo de la sección SIGUIENTE (o ANTERIOR si top=true).
 * `flip`  → espeja la onda horizontalmente (alterna la dirección de la S).
 * `top`   → posiciona la onda en el BORDE SUPERIOR de la sección.
 *            Permite que la imagen de la sección llegue hasta la onda de transición
 *            (mismo patrón que la onda inferior, pero en el borde de arriba).
 */
interface WaveProps {
  fill: string;
  flip?: boolean;
  top?: boolean;
  className?: string;
}

// Onda en S: sube a la izquierda, baja a la derecha
const PATH        = "M0,70 C360,-30 1080,130 1440,30 L1440,100 L0,100 Z";
// Onda en S invertida: baja a la izquierda, sube a la derecha
const PATH_FLIP   = "M0,30 C360,130 1080,-30 1440,70 L1440,100 L0,100 Z";

export function Wave({ fill, flip = false, top = false, className = "" }: WaveProps) {
  return (
    <div
      className={`absolute ${top ? "top-0" : "bottom-0"} left-0 right-0 overflow-hidden leading-none ${className}`}
      style={top ? { transform: "scaleY(-1)" } : undefined}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="relative block w-full h-20 sm:h-28"
      >
        <path fill={fill} d={flip ? PATH_FLIP : PATH} />
      </svg>
    </div>
  );
}
