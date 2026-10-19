"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDebounce } from "@/app/lib/hooks/useDebounce";
import type { RootState } from "@/redux/store";
import type { FiltersState } from "@/types";
import { useProducts } from "@/app/lib/hooks/useProducts";
import { useRubros, useMarcas } from "@/app/lib/hooks/useCategories";
import { FiltersPanel } from "@/components/filters/FiltersPanel";
import { SelectionHeader, EmptyResults, describirSeleccion, hayFiltrosActivos } from "@/components/filters/CatalogStatus";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/product/ProductSkeleton";
import { SortSelector } from "@/components/product/SortSelector";
import { ChevronLeft, ChevronRight } from "lucide-react";

const INITIAL_FILTERS: FiltersState = {
  category:    null,
  subcategory: null,
  precio_max:  null,
  nromar:      null,
  nombre:      null,
  ordering:    null,
  solo_stock:  false,
};

export default function CatalogoPage() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [page,    setPage]    = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const debouncedNombre = useDebounce(filters.nombre, 400);
  const filtersParaQuery = { ...filters, nombre: debouncedNombre };

  const { data: rubros = [] } = useRubros();
  const { data: marcas = [] } = useMarcas();
  const { data, isLoading }   = useProducts(filtersParaQuery, page, true, isAuthenticated);

  function handleChange(partial: Partial<FiltersState>) {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPage(1);
  }

  // "Ver todos los productos": vuelve al catálogo completo pero respeta el orden elegido.
  function handleClear() {
    setFilters((prev) => ({ ...INITIAL_FILTERS, ordering: prev.ordering }));
    setPage(1);
  }

  const products   = data?.results ?? [];
  const totalPages = data?.total_pages ?? 1;
  const titulo     = describirSeleccion(filters, rubros, marcas);

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-brand">Catálogo</h1>
        </div>

        {/*
          flex-col on mobile: FiltersPanel's mobile trigger stacks full-width above products.
          lg:flex-row on desktop: FiltersPanel's <aside> sits next to the products column.
        */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <FiltersPanel
            rubros={rubros}
            marcas={marcas}
            filters={filters}
            onChange={handleChange}
          />

          {/* Products */}
          <div className="flex-1 min-w-0">
            <SelectionHeader
              titulo={titulo}
              count={data?.count}
              soloStock={filters.solo_stock ?? false}
              mostrarVerTodos={hayFiltrosActivos(filters)}
              onVerTodos={handleClear}
            />

            {/* Toolbar: filtro stock + orden */}
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.solo_stock ?? false}
                  onChange={(e) => handleChange({ solo_stock: e.target.checked })}
                  className="w-5 h-5 rounded border-brand/40 text-brand accent-brand cursor-pointer"
                />
                <span className="text-base text-brand-darker">Mostrar solo productos con stock</span>
              </label>

              <SortSelector
                value={filters.ordering}
                onChange={(ordering) => handleChange({ ordering })}
                isAuthenticated={mounted && isAuthenticated}
              />
            </div>

            {isLoading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <EmptyResults
                titulo={titulo}
                busqueda={debouncedNombre}
                soloStock={filters.solo_stock ?? false}
                onVerTodos={handleClear}
                onIncluirSinStock={() => handleChange({ solo_stock: false })}
              />
            ) : (
              <ProductGrid products={products} isAuthenticated={mounted && isAuthenticated} />
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 rounded-lg border-2 border-brand/30 text-brand-darker hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1 flex-wrap justify-center">
                  {buildPageRange(page, totalPages).map((p, idx) =>
                    p === "…" ? (
                      <span key={`e-${idx}`} className="px-2 py-2 text-brand-dark text-base select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-11 h-11 rounded-lg text-base font-semibold transition-colors ${
                          page === p
                            ? "bg-brand-dark text-white"
                            : "border-2 border-brand/30 text-brand-darker hover:bg-brand-light"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-3 rounded-lg border-2 border-brand/30 text-brand-darker hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
  const pages = Array.from({ length: total }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 2);

  return pages.reduce<(number | "…")[]>((acc, p, idx, arr) => {
    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
    acc.push(p);
    return acc;
  }, []);
}
