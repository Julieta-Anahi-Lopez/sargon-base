import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  image: string;
  stock?: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Agregar un producto al carrito
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const cantidadToAdd = action.payload.cantidad || 1;
      const existingItem = state.items.find((item) => item.codigo === action.payload.codigo);
      if (existingItem) {
        existingItem.cantidad += cantidadToAdd;
      } else {
        state.items.push({ ...action.payload, cantidad: cantidadToAdd });
      }
      // Verificar que estamos en el navegador antes de usar localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("cart", JSON.stringify(state.items)); // Guardar en localStorage
      }
    },
    // Eliminar un producto del carrito o reducir su cantidad
    removeFromCart: (state, action: PayloadAction<string | { codigo: string, removeCompletely?: boolean }>) => {
      let codigo: string;
      let removeCompletely: boolean = false;

      // Determinar si queremos eliminar por completo o solo reducir cantidad
      if (typeof action.payload === 'string') {
        codigo = action.payload;
      } else {
        codigo = action.payload.codigo;
        removeCompletely = action.payload.removeCompletely || false;
      }

      const itemIndex = state.items.findIndex((item) => item.codigo === codigo);
      
      if (itemIndex !== -1) {
        if (removeCompletely || state.items[itemIndex].cantidad <= 1) {
          // Si removeCompletely es true o solo queda 1 unidad, eliminamos el producto
          state.items = state.items.filter((item) => item.codigo !== codigo);
        } else {
          // Si hay más de 1 unidad y no queremos eliminar por completo, reducimos en 1
          state.items[itemIndex].cantidad -= 1;
        }
        
        // Actualizar localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(state.items));
        }
      }
    },
    // Vaciar el carrito
    clearCart: (state) => {
      state.items = [];
      // Verificar que estamos en el navegador antes de usar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("cart");
      }
    },
    // Reemplazar el carrito completo (usado al cargar desde backend)
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    // Establecer una cantidad exacta para un producto (sin importar dirección)
    setQuantity: (state, action: PayloadAction<{ codigo: string; cantidad: number }>) => {
      const item = state.items.find((i) => i.codigo === action.payload.codigo);
      if (!item) return;
      if (action.payload.cantidad <= 0) {
        state.items = state.items.filter((i) => i.codigo !== action.payload.codigo);
      } else {
        item.cantidad = action.payload.cantidad;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    // Cargar el carrito desde localStorage
    loadCartFromStorage: (state) => {
      // Verificar que estamos en el navegador antes de usar localStorage
      if (typeof window !== 'undefined') {
        const cart = localStorage.getItem("cart");
        if (cart) {
          try {
            state.items = JSON.parse(cart);
          } catch {
            state.items = [];
          }
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, clearCart, setCart, setQuantity, loadCartFromStorage } = cartSlice.actions;
export default cartSlice.reducer; 



























