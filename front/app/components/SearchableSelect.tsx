"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

interface Option {
  label: string;
  value: string | number;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Todas",
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(
    (opt) => opt.value.toString() === value?.toString()
  );

  const filtered = search
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  const handleSelect = (optValue: string | number) => {
    onChange(optValue.toString());
    setSearch("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSearch("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearch("");
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Cerrar al hacer click fuera
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setSearch("");
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`
          flex items-center w-full h-9 text-sm
          bg-white/95 text-gray-800
          border-0 rounded-lg
          transition-all duration-200
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isOpen ? "ring-2 ring-white/50 bg-white" : ""}
        `}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : selectedOption?.label || ""}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedOption && !isOpen ? selectedOption.label : placeholder}
          disabled={disabled}
          className={`
            w-full h-full pl-3 pr-8 bg-transparent border-0 outline-none text-sm
            placeholder-gray-400
            ${!isOpen && selectedOption ? "font-medium" : ""}
          `}
          readOnly={!isOpen}
        />
        {selectedOption && !isOpen ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        ) : (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </div>

      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
          <li
            onClick={() => handleClear()}
            className="px-3 py-2 text-sm text-gray-400 hover:bg-amber-50 cursor-pointer"
          >
            {placeholder}
          </li>
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`
                  px-3 py-2 text-sm cursor-pointer transition-colors
                  ${opt.value.toString() === value?.toString()
                    ? "bg-amber-100 text-amber-900 font-medium"
                    : "text-gray-800 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700"
                  }
                `}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-400">
              Sin resultados
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
