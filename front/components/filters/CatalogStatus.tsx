import { ArrowLeft } from "lucide-react";
import type { Rubro, Marca, FiltersState } from "@/types";
import { capitalizar } from "@/lib/format";

const verTodosClass =
  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-brand-dark bg-accent text-base font-bold text-brand-dark shadow-sm hover:bg-accent-dark transition-colors";

/** Describe en palabras qué está mirando el usuario ("Aceites comestibles › Chia"). */
export function describirSeleccion(filters: FiltersState, rubros: Rubro[], marcas: Marca[]): string {
  if (filters.nombre) return `Resultados para "${filters.nombre}"`;

  // Los códigos de subrubro son únicos DENTRO de cada rubro, no globalmente.
  const rubro = rubros.find((r) => String(r.codigo) === filters.category);
  if (rubro) {
    const subrubro = rubro.subrubros?.find((s) => String(s.codigo) === filters.subcategory);
    return subrubro ? `${capitalizar(rubro.nombre)} › ${capitalizar(subrubro.nombre)}` : capitalizar(rubro.nombre);
  }

  const marca = marcas.find((m) => String(m.codigo) === filters.nromar);
  if (marca) return `Marca ${capitalizar(marca.nombre)}`;

  return "Todos los productos";
}

export function hayFiltrosActivos(f: FiltersState) {
  return Boolean(f.category || f.subcategory || f.nromar || f.nombre || f.solo_stock);
}

interface HeaderProps {
  titulo:     string;
  count?:     number;
  soloStock:  boolean;
  mostrarVerTodos: boolean;
  onVerTodos: () => void;
}

/** Cartel "Estás viendo…" arriba de la grilla, como el cartel de una góndola. */
export function SelectionHeader({ titulo, count, soloStock, mostrarVerTodos, onVerTodos }: HeaderProps) {
  return (
    <div className="mb-4 rounded-xl border border-brand/25 bg-brand-light/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-brand-dark">Estás viendo:</p>
        <h2 className="text-xl font-bold text-brand-darker leading-snug break-words">{titulo}</h2>
        {count !== undefined && (
          <p className="text-base text-brand-dark mt-0.5">
            {count} {count === 1 ? "producto" : "productos"}
            {soloStock && " con stock"}
          </p>
        )}
      </div>
      {mostrarVerTodos && (
        <button type="button" onClick={onVerTodos} className={verTodosClass}>
          <ArrowLeft size={18} strokeWidth={2.5} /> Ver todos los productos
        </button>
      )}
    </div>
  );
}

interface EmptyProps {
  titulo:          string;
  busqueda:        string | null;
  soloStock:       boolean;
  onVerTodos:      () => void;
  onIncluirSinStock: () => void;
}

/** Resultado vacío que explica qué pasó y siempre ofrece una salida. */
export function EmptyResults({ titulo, busqueda, soloStock, onVerTodos, onIncluirSinStock }: EmptyProps) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4 gap-4">
      <p className="text-xl font-bold text-brand-darker">
        {busqueda
          ? `No encontramos productos con "${busqueda}"`
          : soloStock
            ? `No hay productos con stock en ${titulo}`
            : `No encontramos productos en ${titulo}`}
      </p>
      {busqueda && (
        <p className="text-base text-brand-dark max-w-md">
          Revisá cómo está escrito o probá con una sola palabra, por ejemplo: aceite.
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {soloStock && (
          <button
            type="button"
            onClick={onIncluirSinStock}
            className="px-4 py-2 rounded-full border-2 border-brand-dark bg-white text-base font-bold text-brand-dark hover:bg-brand-light transition-colors"
          >
            Mostrar también los que no tienen stock
          </button>
        )}
        <button type="button" onClick={onVerTodos} className={verTodosClass}>
          <ArrowLeft size={18} strokeWidth={2.5} /> Ver todos los productos
        </button>
      </div>
    </div>
  );
}
