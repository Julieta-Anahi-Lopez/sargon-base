"use client";

import { ArrowUpDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

const BASE_OPTIONS: Option[] = [
  { value: "",            label: "Relevancia"        },
  { value: "nombre_asc",  label: "Nombre A → Z"      },
  { value: "nombre_desc", label: "Nombre Z → A"      },
];

const PRICE_OPTIONS: Option[] = [
  { value: "precio_asc",  label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
];

interface Props {
  value: string | null;
  onChange: (ordering: string | null) => void;
  isAuthenticated: boolean;
}

export function SortSelector({ value, onChange, isAuthenticated }: Props) {
  const options = isAuthenticated ? [...BASE_OPTIONS, ...PRICE_OPTIONS] : BASE_OPTIONS;

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown size={14} className="text-brand/60 shrink-0" />
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="text-sm text-brand bg-transparent border border-brand/25 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-brand/50 focus:outline-none focus:border-brand transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
