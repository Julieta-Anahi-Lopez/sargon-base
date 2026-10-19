"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, Package2 } from 'lucide-react';
import { addToCart, removeFromCart } from '@/redux/slices/cartSlice';
import { AppDispatch } from '@/store';

// Definimos interfaces para los tipos de datos
interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  image: string;
}

interface PedidoDetalle {
  compro: string;
  nroord: number;
  codart: string;
  cantid: number;
  descri: string;
  penden: number;
  pendfc: number;
  precio: number;
  nrolis: number;
  pordes: number;
  nroemp: number;
  observ: string;
  poruni: number;
}

interface Pedido {
  compro: string;
  detalles: PedidoDetalle[];
  nrocli: number;
  fecped: string;
  plazo: string;
  lugent: string;
  condic: string;
  observ: string;
  nrousu: number;
  nroven: number;
  imputa: number;
  nombpc: string;
  origen: string;
  nroemp: number;
  tipdep: number;
  nroest: string;
}

interface CartPreviewProps {
  cartItems: CartItem[];
  pedidos: Pedido[];
  pedidosLoading: boolean;
  dispatch: AppDispatch;
}

// Componente para la vista previa del carrito con pestañas
export default function CartPreview({ cartItems, pedidos, pedidosLoading, dispatch }: CartPreviewProps) {
  // Estado para controlar qué pestaña está activa
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  
  // Calcular el total del carrito
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.precio * item.cantidad, 
    0
  );

  // Formatear fecha de pedido
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full">
      {/* Pestañas de navegación */}
      <div className="flex border-b mb-3">
        <button
          onClick={() => setActiveTab('cart')}
          className={`flex items-center px-4 py-2 font-medium text-sm ${
            activeTab === 'cart' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingCart size={16} className="mr-2" />
          Carrito
          {cartItems.length > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium rounded-full px-2 py-0.5">
              {cartItems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center px-4 py-2 font-medium text-sm ${
            activeTab === 'orders' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package2 size={16} className="mr-2" />
          Mis Pedidos
          {pedidos.length > 0 && (
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-medium rounded-full px-2 py-0.5">
              {pedidos.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido de la pestaña del carrito */}
      {activeTab === 'cart' && (
        <>
          {cartItems.length === 0 ? (
            <div className="py-8 text-center">
              <div className="flex justify-center mb-2">
                <ShoppingCart size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">El carrito está vacío</p>
            </div>
          ) : (
            <>
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map((item) => {
                  const subtotal = item.precio * item.cantidad;
                  return (
                    <li key={item.codigo} className="flex items-center gap-4 border-b pb-3">
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0">
                        <Image 
                          src={item.image} 
                          alt={item.nombre} 
                          width={50} 
                          height={50} 
                          className="rounded object-cover"
                        />
                      </div>
                      
                      {/* Información del producto */}
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-full">
                          {item.nombre}
                        </p>
                        <div className="flex justify-between mt-1">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => {
                                // El reducer maneja automáticamente: resta 1 si hay más, o elimina si queda 1
                                dispatch(removeFromCart(item.codigo));
                              }}
                              className="px-2 py-1 text-amber-600 hover:bg-amber-50"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 text-gray-700 text-sm font-medium">{item.cantidad}</span>
                            <button
                              onClick={() => dispatch(addToCart({ ...item, cantidad: 1 }))}
                              className="px-2 py-1 text-amber-600 hover:bg-amber-50"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              // Eliminar completamente el producto del carrito
                              dispatch(removeFromCart({ codigo: item.codigo, removeCompletely: true }))
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Precio y subtotal */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500">
                          ${item.precio.toFixed(2)} x {item.cantidad}
                        </p>
                        <p className="text-sm font-semibold text-amber-600">
                          ${subtotal.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              {/* Total del carrito */}
              <div className="mt-3 pt-2 border-t flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-amber-700">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              
              {/* Botón para ir al carrito */}
              <Link 
                href="/cart" 
                className="block text-center bg-amber-600 text-white mt-3 py-2 rounded-md hover:bg-amber-700 transition-colors"
              >
                Ver Carrito
              </Link>
            </>
          )}
        </>
      )}

      {/* Contenido de la pestaña de pedidos */}
      {activeTab === 'orders' && (
        <>
          {pedidosLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="py-8 text-center">
              <div className="flex justify-center mb-2">
                <Package2 size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No tienes pedidos realizados</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div key={pedido.compro} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800">
                          Pedido #{pedido.compro}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatDate(pedido.fecped)}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        {pedido.detalles.length} artículos
                      </span>
                    </div>
                    
                    {/* Mostrar primeros 2 items y contador si hay más */}
                    <div className="space-y-2 mt-2">
                      {pedido.detalles.slice(0, 2).map((detalle) => (
                        <div key={`${pedido.compro}-${detalle.nroord}`} className="flex justify-between text-sm">
                          <span className="text-gray-700 truncate flex-grow">{detalle.descri}</span>
                          <span className="text-gray-600 ml-2 whitespace-nowrap">
                            ${detalle.precio.toFixed(2)} x {detalle.cantid}
                          </span>
                        </div>
                      ))}
                      
                      {pedido.detalles.length > 2 && (
                        <p className="text-xs text-gray-500 italic">
                          Y {pedido.detalles.length - 2} artículos más...
                        </p>
                      )}
                    </div>
                    
                    {/* Mostrar observaciones si existen */}
                    {pedido.observ && pedido.observ !== "Sin observaciones" && (
                      <p className="text-xs text-gray-600 mt-2 border-t pt-1">
                        <span className="font-medium">Observaciones:</span> {pedido.observ}
                      </p>
                    )}
                    
                    {/* Total del pedido */}
                    <div className="mt-2 pt-2 border-t flex justify-between">
                      <span className="text-xs font-medium">Total:</span>
                      <span className="text-sm font-bold text-amber-700">
                        ${pedido.detalles.reduce((sum, item) => sum + (item.precio * item.cantid), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}