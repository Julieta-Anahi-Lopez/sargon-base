"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { Rubro, Marca, FiltersState } from "@/types";
import SearchableSelect from "./SearchableSelect";

interface Props {
  rubros: Rubro[];
  marcas: Marca[];
  onChange: (filters: FiltersState) => void;
  initialFilters?: FiltersState;
}

const defaultFilters: FiltersState = {
  category:    null,
  subcategory: null,
  precio_max:  null,
  nromar:      null,
  nombre:      null,
  ordering:    null,
  solo_stock:  false,
};

// Configuración de debounce por campo
const DEBOUNCE_CONFIG = {
  codigo: { delay: 400, minLength: 2 },
  nombre: { delay: 400, minLength: 2 },
  precio_max: { delay: 500, minLength: 1 },
};

export default function FiltersPanel({ rubros, marcas, onChange, initialFilters }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [localFilters, setLocalFilters] = useState<FiltersState>(defaultFilters);

  // Refs para los timeouts de debounce
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const isInitialMount = useRef(true);

  // Marcar como montado y sincronizar filtros iniciales
  useEffect(() => {
    setIsMounted(true);
    if (initialFilters) {
      setLocalFilters(initialFilters);
    }
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar con filtros cuando cambien
  useEffect(() => {
    if (isMounted && initialFilters) {
      setLocalFilters(initialFilters);
    }
  }, [initialFilters, isMounted]);

  // Inicialización responsive
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDesktop = window.matchMedia("(min-width: 640px)").matches;
      if (isDesktop) {
        setIsCollapsed(false);
      }
    }
  }, []);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  // Función para aplicar filtros con debounce
  const applyFiltersDebounced = useCallback((newFilters: FiltersState, field: string) => {
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field]);
    }

    const config = DEBOUNCE_CONFIG[field as keyof typeof DEBOUNCE_CONFIG];
    if (!config) {
      onChange(newFilters);
      return;
    }

    const value = newFilters[field as keyof FiltersState];
    const valueStr = value?.toString() || "";

    if (valueStr === "") {
      onChange(newFilters);
      return;
    }

    if (valueStr.length < config.minLength) {
      return;
    }

    debounceTimers.current[field] = setTimeout(() => {
      onChange(newFilters);
    }, config.delay);
  }, [onChange]);

  // Handler para selects - aplicar inmediatamente
  const handleSelectChange = (name: string, value: string) => {
    const newFilters = {
      ...localFilters,
      [name]: value === "" ? null : value,
      ...(name === "category" ? { subcategory: null } : {}),
    };
    setLocalFilters(newFilters);

    if (!isInitialMount.current) {
      onChange(newFilters);
    }
  };

  // Handler para inputs - aplicar con debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = {
      ...localFilters,
      [name]: value === "" ? null : value,
    };
    setLocalFilters(newFilters);

    if (!isInitialMount.current) {
      applyFiltersDebounced(newFilters, name);
    }
  };

  // Limpiar un filtro específico
  const clearFilter = (name: string) => {
    const newFilters = {
      ...localFilters,
      [name]: null,
      ...(name === "category" ? { subcategory: null } : {}),
    };
    setLocalFilters(newFilters);
    if (!isInitialMount.current) {
      onChange(newFilters);
    }
  };

  const activeFilterCount = Object.values(localFilters).filter(Boolean).length;

  // Configuración de campos
  const filterFields = [
    {
      label: "Marca",
      name: "nromar",
      type: "select",
      options: marcas.map((m) => ({ label: m.nombre, value: m.codigo })),
      width: "w-full sm:w-36",
    },
    {
      label: "Código",
      name: "codigo",
      type: "input",
      placeholder: "Buscar...",
      width: "w-full sm:w-28",
    },
    {
      label: "Nombre",
      name: "nombre",
      type: "input",
      placeholder: "Buscar...",
      width: "w-full sm:w-44",
    },
    {
      label: "Categoría",
      name: "category",
      type: "select",
      options: rubros.map((r) => ({ label: r.nombre, value: r.codigo })),
      width: "w-full sm:w-40",
    },
    {
      label: "Subcategoría",
      name: "subcategory",
      type: "select",
      options:
        rubros.find((r) => r.codigo.toString() === localFilters.category)
          ?.subrubros.map((s) => ({ label: s.nombre, value: s.codigo })) || [],
      width: "w-full sm:w-40",
      disabled: !localFilters.category,
    },
    {
      label: "Precio máx.",
      name: "precio_max",
      type: "number",
      placeholder: "$",
      width: "w-full sm:w-28",
    },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 sticky top-0 z-40 shadow-lg">
      {/* Toggle en mobile */}
      <div className="sm:hidden px-4 py-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <Search size={18} />
            <span className="font-medium">Filtrar productos</span>
            {isMounted && activeFilterCount > 0 && (
              <span className="bg-white text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${!isCollapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Panel de filtros */}
      <div
        className={`
          ${isCollapsed ? "hidden sm:block" : "block"}
          max-w-screen-xl mx-auto px-4 pb-4 sm:py-4
        `}
      >
        <div className="flex flex-wrap gap-3 items-end">
          {filterFields.map(({ label, name, type, options = [], placeholder, width, disabled }) => {
            const value = localFilters[name as keyof FiltersState] as string | number | null;
            const hasValue = value !== null && value !== "";

            return (
              <div key={name} className={`flex flex-col gap-1 ${width}`}>
                <label className="text-xs font-medium text-amber-100 pl-1">
                  {label}
                </label>
                <div className="relative">
                  {type === "input" || type === "number" ? (
                    <>
                      <input
                        type={type === "number" ? "number" : "text"}
                        name={name}
                        value={value || ""}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        className="
                          w-full h-9 pl-3 pr-8 text-sm
                          bg-white/95 text-gray-800 placeholder-gray-400
                          border-0 rounded-lg
                          focus:ring-2 focus:ring-white/50 focus:bg-white
                          transition-all duration-200
                        "
                      />
                      {hasValue && (
                        <button
                          onClick={() => clearFilter(name)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </>
                  ) : (
                    <SearchableSelect
                      options={options}
                      value={value}
                      onChange={(val) => handleSelectChange(name, val)}
                      placeholder="Todas"
                      disabled={disabled}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Indicador de filtros activos en desktop */}
          {isMounted && activeFilterCount > 0 && (
            <div className="hidden sm:flex items-end pb-1">
              <span className="text-xs text-amber-200 whitespace-nowrap">
                {activeFilterCount} filtro{activeFilterCount > 1 ? "s" : ""} activo{activeFilterCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
