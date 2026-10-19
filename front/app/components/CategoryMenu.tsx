"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { setCategory } from "@/redux/slices/filtersSlice";
import { RootState } from "@/store";

interface SubRubro {
  nrorub: number;
  codigo: number;
  nombre: string;
}

interface Rubro {
  codigo: number;
  nombre: string;
  verweb?: string;
  nrodep?: string;
  subrubros: SubRubro[];
}

interface CategoryMenuProps {
  rubros: Rubro[];
}

export default function CategoryMenu({ rubros }: CategoryMenuProps) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: number]: boolean }>({});

  const selectedCategory = useSelector((state: RootState) => state.filters.category);
  const selectedSubcategory = useSelector((state: RootState) => state.filters.subcategory);

  function normalizeText(text: string) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  const toggleCategory = (e: React.MouseEvent, categoryId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategorySelect = (categoryName: string, categoryCode: number) => {
    dispatch(setCategory({ category: categoryName, subcategory: undefined }));
    const category = rubros.find(r => r.codigo === categoryCode);
    if (category && category.subrubros.length > 0) {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryCode]: true
      }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubcategorySelect = (categoryName: string, categoryCode: number, subcategoryName: string, subcategoryCode: number) => {
    dispatch(setCategory({
      category: categoryName,
      subcategory: subcategoryName
    }));
  };

  const isCategorySelected = (rubroNombre: string) => {
    return selectedCategory === rubroNombre;
  };

  const isSubcategorySelected = (rubroNombre: string, subrubroNombre: string) => {
    return selectedCategory === rubroNombre && selectedSubcategory === subrubroNombre;
  };

  return (
    <>
      {/* FAB móvil */}
      <button
        className="md:hidden fixed bottom-4 left-4 z-50 bg-amber-700 text-white p-3 rounded-full shadow-md ring-2 ring-white/10"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar desktop */}
      <div
        className={`hidden md:flex flex-col bg-amber-700 text-white p-5 shadow-inner border-r border-amber-950 transition-all duration-300 ease-in-out 
        ${isOpen ? "w-64" : "w-16 overflow-hidden min-w-[16px]"}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-4 flex items-center justify-between w-full text-white"
        >
          {isOpen && <span className="text-base font-semibold tracking-wide uppercase">Categorías</span>}
          <Menu className="w-5 h-5" />
        </button>

        {isOpen && (
          <ul className="space-y-2">
            {rubros.map((rubro) => (
              <li key={rubro.codigo}>
                <div className="flex items-center justify-between group">
                  <button
                    className={`text-left text-sm font-medium py-1 px-1.5 rounded transition-colors duration-150 flex-grow hover:text-amber-100 ${
                      isCategorySelected(rubro.nombre) ? 'text-amber-200 font-semibold' : 'text-white'
                    }`}
                    onClick={() => handleCategorySelect(rubro.nombre, rubro.codigo)}
                  >
                    {normalizeText(rubro.nombre)}
                  </button>

                  {rubro.subrubros.length > 0 && (
                    <button
                      onClick={(e) => toggleCategory(e, rubro.codigo)}
                      className="p-1 opacity-80 hover:opacity-100 transition"
                    >
                      {expandedCategories[rubro.codigo] ? (
                        <ChevronDown className="w-4 h-4 text-white" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white" />
                      )}
                    </button>
                  )}
                </div>

                {rubro.subrubros.length > 0 && expandedCategories[rubro.codigo] && (
                  <ul className="ml-4 mt-1 space-y-0.5 border-l border-amber-700 pl-2">
                    {rubro.subrubros.map((subrubro) => (
                      <li key={`${subrubro.nrorub}-${subrubro.codigo}`}>
                        <button
                          className={`text-sm text-amber-100 hover:text-white hover:underline pl-2 py-1 w-full text-left transition ${
                            isSubcategorySelected(rubro.nombre, subrubro.nombre)
                              ? 'text-amber-200 font-semibold'
                              : ''
                          }`}
                          onClick={() =>
                            handleSubcategorySelect(rubro.nombre, rubro.codigo, subrubro.nombre, subrubro.codigo)
                          }
                        >
                          {normalizeText(subrubro.nombre)}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sidebar móvil */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex z-[9999]">
          <div className="bg-amber-700 w-64 h-full p-5 overflow-y-auto shadow-xl">
            <button onClick={() => setIsMobileOpen(false)} className="mb-6 text-white flex justify-end">
              <X className="w-6 h-6" />
            </button>
            <ul className="space-y-2">
              {rubros.map((rubro) => (
                <li key={rubro.codigo}>
                  <div className="flex items-center justify-between group">
                    <button
                      className={`text-left text-sm font-medium py-1 px-1.5 rounded transition-colors duration-150 flex-grow hover:text-amber-100 ${
                        isCategorySelected(rubro.nombre) ? 'text-amber-200 font-semibold' : 'text-white'
                      }`}
                      onClick={() => handleCategorySelect(rubro.nombre, rubro.codigo)}
                    >
                      {normalizeText(rubro.nombre)}
                    </button>

                    {rubro.subrubros.length > 0 && (
                      <button
                        onClick={(e) => toggleCategory(e, rubro.codigo)}
                        className="p-1 opacity-80 hover:opacity-100 transition"
                      >
                        {expandedCategories[rubro.codigo] ? (
                          <ChevronDown className="w-4 h-4 text-white" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white" />
                        )}
                      </button>
                    )}
                  </div>

                  {rubro.subrubros.length > 0 && expandedCategories[rubro.codigo] && (
                    <ul className="ml-4 mt-1 space-y-0.5 border-l border-amber-700 pl-2">
                      {rubro.subrubros.map((subrubro) => (
                        <li key={`${subrubro.nrorub}-${subrubro.codigo}`}>
                          <button
                            className={`text-sm text-amber-100 hover:text-white hover:underline pl-2 py-1 w-full text-left transition ${
                              isSubcategorySelected(rubro.nombre, subrubro.nombre)
                                ? 'text-amber-200 font-semibold'
                                : ''
                            }`}
                            onClick={() =>
                              handleSubcategorySelect(rubro.nombre, rubro.codigo, subrubro.nombre, subrubro.codigo)
                            }
                          >
                            {normalizeText(subrubro.nombre)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

