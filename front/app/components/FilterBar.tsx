






"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFilters } from "@/redux/slices/filtersSlice";

const getSelectedPrice = (state: RootState) => state.filters.precio_max;
const getSelectedBrand = (state: RootState) => state.filters.nromar;
const getSelectedName = (state: RootState) => state.filters.nombre;

interface Marca {
  codigo: number;
  nombre: string;
  verweb: number;
}

interface FilterBarProps {
  marcas: Marca[];
}

export default function FilterBar({ marcas }: FilterBarProps) {
  const dispatch = useDispatch();

  const selectedPrice = useSelector(getSelectedPrice);
  const selectedBrand = useSelector(getSelectedBrand);
  const selectedName = useSelector(getSelectedName);

  const [priceRange, setPriceRange] = useState(selectedPrice || 100);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState(selectedName || "");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(selectedBrand || "");

  const updateFilters = (key: string, value: string | number | null) => {
    dispatch(setFilters({ [key]: value }));
  };

  const inputClass = "text-sm border border-gray-300 text-gray-800 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-700 w-full";
  const labelClass = "text-sm text-amber-800 font-medium";

  return (
    <div className="bg-gray-50 p-4 border-b border-gray-200 shadow-sm pt-32">
      <div className="container max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap">
          {/* Código */}
          <input
            type="text"
            placeholder="Código"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              updateFilters("codigo", e.target.value);
            }}
            className={`${inputClass} md:w-40`}
          />

          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              updateFilters("nombre", e.target.value);
            }}
            className={`${inputClass} md:w-60`}
          />

          {/* Marca */}
          <select
            className={`${inputClass} text-gray-700 md:w-48`}
            value={marcaSeleccionada}
            onChange={(e) => {
              setMarcaSeleccionada(e.target.value);
              updateFilters("nromar", e.target.value);
            }}
          >
            <option value="">Seleccione una marca</option>
            {marcas.map((marca) => (
              <option key={marca.codigo} value={marca.nombre}>
                {marca.nombre}
              </option>
            ))}
          </select>

          {/* Precio */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className={labelClass}>Precio:</label>
            <input
              type="range"
              min="0"
              max="100000"
              value={priceRange}
              onChange={(e) => {
                const value = Number(e.target.value);
                setPriceRange(value);
                updateFilters("precio_max", value);
              }}
              className="accent-amber-700 md:w-40"
            />
            <span className="text-sm text-gray-700">${priceRange}</span>
          </div>
        </div>
      </div>
    </div>
  );
}





