// redux/slices/orderSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';

// Definir la interfaz del estado
interface OrderState {
  loading: boolean;
  success: boolean;
  error: string | null;
  orderId: string | null;
}

// Estado inicial
const initialState: OrderState = {
  loading: false,
  success: false,
  error: null,
  orderId: null
};

// Acción asíncrona para enviar el pedido
export const submitOrder = createAsyncThunk(
  'order/submit',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      
      // Obtener los items del carrito
      const cartItems = state.cart.items;
      
      // Obtener la información de autenticación
      const authToken = state.auth.token || localStorage.getItem('auth_token');
      const user = state.auth.user;
      
      if (!authToken) {
        return rejectWithValue('No se encontró token de autenticación');
      }
      
      // Preparar los datos del pedido
      const orderData = {
        items: cartItems,
        user: user?.codigo, // O cualquier identificador que uses
        total: cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      };
      
      // Enviar a la API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.detail || 'Error al enviar el pedido');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

// Crear el slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orderId = action.payload.id; // O cualquier ID que devuelva tu API
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;