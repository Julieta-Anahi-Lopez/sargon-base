"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import type { Rubro, Marca, FiltersState } from "@/types";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { capitalizar } from "@/lib/format";

interface Props {
  rubros:   Rubro[];
  marcas:   Marca[];
  filters:  FiltersState;
  onChange: (f: Partial<FiltersState>) => void;
}

// Categoría, marca y búsqueda son formas EXCLUYENTES de recorrer el catálogo:
// elegir una limpia las otras. Así el usuario "va a otro lugar" en vez de
// acumular condiciones que pueden dar cero resultados.
const RESET_NAVEGACION: Partial<FiltersState> = {
  category:    null,
  subcategory: null,
  nromar:      null,
  nombre:      null,
};

export function FiltersPanel({ rubros, marcas, filters, onChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const panel = (
    <FilterContent
      rubros={rubros}
      marcas={marcas}
      filters={filters}
      onChange={onChange}
    />
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
        {panel}
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-brand/40 bg-brand-light text-base font-semibold text-brand-darker hover:bg-brand/20 transition-colors"
        >
          <SlidersHorizontal size={18} />
          Buscar por categoría o marca
        </button>
      </div>

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Buscar productos"
        side="bottom"
      >
        <div className="px-4 py-4">
          {panel}
          <Button fullWidth size="lg" onClick={() => setMobileOpen(false)} className="mt-4">
            Ver productos
          </Button>
        </div>
      </Drawer>
    </>
  );
}

function FilterContent({ rubros, marcas, filters, onChange }: Props) {
  const [openRubros, setOpenRubros] = useState(true);
  const [openMarcas, setOpenMarcas] = useState(false);
  const [openRubroId, setOpenRubroId] = useState<number | null>(
    filters.category ? Number(filters.category) : null
  );

  // Mantener openRubroId sincronizado con filters.category.
  // Sin esto, al cambiar a una marca o a "Ver todos" el rubro viejo quedaba
  // visualmente expandido y el usuario podía clickear subrubros huérfanos.
  useEffect(() => {
    setOpenRubroId(filters.category ? Number(filters.category) : null);
  }, [filters.category]);

  const itemClass = (selected: boolean) =>
    `w-full text-left flex items-center justify-between gap-2 min-h-11 px-3 py-2 rounded-lg text-base transition-colors ${
      selected
        ? "bg-brand-dark text-white font-semibold"
        : "text-brand-darker hover:bg-brand-light"
    }`;

  return (
    <div className="space-y-1">
      <p className="text-lg font-bold text-brand-darker mb-3">Buscar productos por</p>

      {/* Búsqueda por nombre */}
      <label className="block">
        <span className="block text-base font-semibold text-brand-darker mb-1.5">Nombre</span>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/70 pointer-events-none" />
          <input
            type="text"
            placeholder="Escribí el producto…"
            value={filters.nombre ?? ""}
            onChange={(e) => onChange({ ...RESET_NAVEGACION, nombre: e.target.value || null })}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-brand/30 bg-white text-brand-darker placeholder-brand-dark/60 text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </label>

      {/* Rubros */}
      <FilterSection
        title="Categorías"
        open={openRubros}
        onToggle={() => setOpenRubros((v) => !v)}
      >
        <ul className="space-y-1">
          {rubros.map((r) => {
            const selected = filters.category === String(r.codigo);
            return (
              <li key={r.codigo}>
                <button
                  onClick={() => {
                    if (selected) {
                      onChange({ category: null, subcategory: null });
                      setOpenRubroId(null);
                    } else {
                      onChange({ ...RESET_NAVEGACION, category: String(r.codigo) });
                      setOpenRubroId(r.codigo);
                    }
                  }}
                  className={itemClass(selected)}
                >
                  <span>{capitalizar(r.nombre)}</span>
                  {r.subrubros?.length > 0 && (
                    <ChevronRight size={18} className={`shrink-0 transition-transform ${openRubroId === r.codigo ? "rotate-90" : ""}`} />
                  )}
                </button>

                {/* Subrubros */}
                {openRubroId === r.codigo && r.subrubros?.length > 0 && (
                  <ul className="ml-3 mt-1 space-y-1 border-l-2 border-brand/40 pl-2">
                    {r.subrubros.map((s) => {
                      const subSelected = filters.subcategory === String(s.codigo);
                      return (
                        <li key={s.codigo}>
                          <button
                            onClick={() => onChange({ subcategory: subSelected ? null : String(s.codigo) })}
                            className={`w-full text-left min-h-11 px-3 py-2 rounded-lg text-base transition-colors ${
                              subSelected
                                ? "bg-brand text-white font-semibold"
                                : "text-brand-darker hover:bg-brand-light"
                            }`}
                          >
                            {capitalizar(s.nombre)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {/* Marcas */}
      <FilterSection
        title="Marcas"
        open={openMarcas}
        onToggle={() => setOpenMarcas((v) => !v)}
      >
        <ul className="space-y-1">
          {marcas.map((m) => {
            const selected = filters.nromar === String(m.codigo);
            return (
              <li key={m.codigo}>
                <button
                  onClick={() => onChange(selected ? { nromar: null } : { ...RESET_NAVEGACION, nromar: String(m.codigo) })}
                  className={itemClass(selected)}
                >
                  {capitalizar(m.nombre)}
                </button>
              </li>
            );
          })}
        </ul>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title, open, onToggle, children,
}: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-brand/20 pt-3 mt-4">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center justify-between w-full min-h-11 text-base font-bold text-brand-darker hover:text-brand mb-1 transition-colors"
      >
        {title}
        <ChevronDown size={20} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && children}
    </div>
  );
}
