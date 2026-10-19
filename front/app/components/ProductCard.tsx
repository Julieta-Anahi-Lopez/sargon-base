"use client";
import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/slices/cartSlice";
import { Minus, Plus, ShoppingCart, Info } from "lucide-react";

interface ProductProps {
  product: {
    id: string,
    codigo: string;
    nombre: string;
    observ: string;
    precio_final: number;
    stock: number;
    imagenes: { foto_1: string }[];
  };
  isAuthenticated: boolean;
}

export default function ProductCard({ product, isAuthenticated }: ProductProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'info';
  }>({ show: false, message: '', type: 'info' });
  const dispatch = useDispatch();


  const fallbackImage = "/Caja.webp";
  const originalImage = product.imagenes?.[0]?.foto_1;
  const [imageSrc, setImageSrc] = useState<string>(originalImage || fallbackImage);
  const [imageKey, setImageKey] = useState<number>(0); // fuerza rerender de <Image>
  const [cantidad, setCantidad] = useState(1);


  const stock = product.stock ?? 0;

  let stockMessage = null;
  if (stock <= 0) {
    stockMessage = "Sin stock";
  } else if (stock <= 5) {
    stockMessage = "¡Quedan pocos!";
  }

  const handleCantidadChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setCantidad(1);
    } else {
      setCantidad(num);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setToast({
        show: true,
        message: "Iniciá sesión para comenzar tu pedido",
        type: "info",
      });
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
      return;
    }

    if (typeof product.precio_final !== "number") return;

    const item = {
      id: product.codigo,
      codigo: product.codigo,
      nombre: product.nombre,
      precio: product.precio_final,
      image: imageSrc,
      cantidad: cantidad,
    };

    dispatch(addToCart(item));
    setToast({
      show: true,
      message: cantidad > 1
        ? `${cantidad} unidades agregadas al carrito`
        : "Producto agregado al carrito",
      type: "success",
    });
    setCantidad(1);
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2000);
  };
  

  function normalizeText(text: string) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  function formatPrice(price: number): string {
    const fixed = price.toFixed(2);
    const [intPart, decPart] = fixed.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedInt},${decPart}`;
  }

  return (
    <>
        <div
          className="
            bg-white dark:bg-gray-900
            border
            border-gray-200 dark:border-gray-700
            rounded-lg
            overflow-hidden
            flex
            flex-col
            shadow-sm
            hover:shadow-md
            transition-shadow
            duration-300
            max-w-[320px]
            w-full
            mx-auto
          "
        >
        {/* Imagen principal */}
        <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">

          <Image
            key={imageKey}
            src={imageSrc}
            alt={product.nombre}
            fill
            onError={() => {
              if (imageSrc !== fallbackImage) {
                setImageSrc(fallbackImage);
                setImageKey(prev => prev + 1); // fuerza rerender
              }
            }}
            className="object-contain p-3"
          />
        </div>

        {/* Contenido */}
        <div className="flex flex-col justify-between flex-grow p-3 sm:p-4 gap-2 sm:gap-3">

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-semibold">
                {product.codigo}
              </span>
              {stockMessage && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                    stock <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {stockMessage}
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
              {normalizeText(product.nombre)}
            </h3>
          </div>

          {/* Precio */}
          {typeof product.precio_final === "number" && (
            <div className="flex justify-end">
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                ${formatPrice(product.precio_final)}
              </span>
            </div>
          )}

          {/* Acciones */}
          



          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-amber-700 border border-amber-200 bg-amber-50 rounded-lg py-2 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200"
            >
              <Info size={16} />
              <span>Más Info</span>
            </button>

            {/* Selector de cantidad + botón agregar */}
            <div className="flex items-stretch gap-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                  disabled={!isAuthenticated || stock <= 0}
                  className="w-7 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => handleCantidadChange(e.target.value)}
                  onBlur={() => { if (cantidad < 1) setCantidad(1); }}
                  disabled={!isAuthenticated || stock <= 0}
                  className="w-8 h-8 text-center text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset disabled:opacity-40 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setCantidad(prev => prev + 1)}
                  disabled={!isAuthenticated || stock <= 0}
                  className="w-7 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!isAuthenticated || stock <= 0}
                className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-lg py-2 min-w-0 transition-all duration-200 ${
                  !isAuthenticated || stock <= 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "text-white bg-amber-600 hover:bg-amber-700 shadow-sm hover:shadow"
                }`}
                title={
                  !isAuthenticated
                    ? "Iniciá sesión para agregar productos"
                    : stock <= 0
                    ? "Producto sin stock"
                    : "Agregar al carrito"
                }
              >
                <ShoppingCart size={18} className="flex-shrink-0" />
                <span className="hidden sm:inline truncate">Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={normalizeText(product.nombre)}
        description={product.observ}
        codigo={product.codigo}
        stock={stock}
        precio={product.precio_final}
        isAuthenticated={isAuthenticated}
        onAddToCart={(qty) => {
          const item = {
            id: product.codigo,
            codigo: product.codigo,
            nombre: product.nombre,
            precio: product.precio_final,
            image: imageSrc,
            cantidad: qty,
          };
          dispatch(addToCart(item));
          setToast({
            show: true,
            message: "Producto agregado al carrito",
            type: "success",
          });
          setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2000);
          setIsModalOpen(false);
        }}
      >
        <div className="relative aspect-square">
          <Image
            key={`modal-${imageKey}`}
            src={imageSrc}
            alt={product.nombre}
            fill
            onError={() => {
              if (imageSrc !== fallbackImage) {
                setImageSrc(fallbackImage);
                setImageKey(prev => prev + 1);
              }
            }}
            className="object-contain p-4"
          />
        </div>
      </Modal>

      {/* Toast */}
      {toast.show && (
          <div
            className={`fixed bottom-20 right-3 sm:right-[88px] py-3 px-3 rounded-md shadow-lg z-50 w-[80vw] max-w-xl flex items-center gap-3 transition-opacity duration-100
              ${
                toast.type === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 11.999 10 8 8 0 0118 10zM9 5a1 1 0 012 0v4a1 1 0 01-2 0V5zm1 8a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm">{toast.message}</p>
          </div>
        )}


    </>
  );
}
