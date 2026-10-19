// redux/slices/filtersSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Definimos la estructura del estado de filtros
interface FiltersState {
  category: string | null;
  subcategory: string | null;
  precio_max: number | null;
  nromar: string | null;
  nombre: string | null;
}

// Estado inicial sin filtros seleccionados
const initialState: FiltersState = {
  category: null,
  subcategory: null,
  precio_max: null,
  nromar: null,
  nombre: null,
};

// Creamos un slice de Redux para manejar filtros
const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    // Acción para cambiar la categoría seleccionada
    setCategory: (state, action: PayloadAction<{ category: string; subcategory?: string }>) => {
      state.category = action.payload.category;
      state.subcategory = action.payload.subcategory || null;
    },
    // Acción para actualizar filtros generales
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

// Exportamos las acciones y el reducer para usarlos en la aplicación
export const { setCategory, setFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
