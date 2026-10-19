import { useState } from "react";

export interface Filters {
  category: string | null;
  subcategory: string | null;
  precio_max: number | null;
  nromar: string | null;
  nombre: string | null;
}

export function useFilters(initial: Filters = {
  category: null,
  subcategory: null,
  precio_max: null,
  nromar: null,
  nombre: null
}) {
  const [filters, setFilters] = useState<Filters>(initial);

  const updateFilter = (key: keyof Filters, value: string | number | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const setCategory = (category: string, subcategory?: string | null) => {
    setFilters(prev => ({
      ...prev,
      category,
      subcategory: subcategory || null
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: null,
      subcategory: null,
      precio_max: null,
      nromar: null,
      nombre: null
    });
  };

  return {
    filters,
    updateFilter,
    setCategory,
    clearFilters
  };
}
