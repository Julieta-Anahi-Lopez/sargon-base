import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface Props {
  products:        Product[];
  isAuthenticated: boolean;
}

export function ProductGrid({ products, isAuthenticated }: Props) {
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400">
        <p className="text-lg font-medium">Sin resultados</p>
        <p className="text-sm mt-1">Probá con otros filtros o buscá otro término.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {products.map((p) => (
        <ProductCard key={p.codigo} product={p} isAuthenticated={isAuthenticated} />
      ))}
    </div>
  );
}
