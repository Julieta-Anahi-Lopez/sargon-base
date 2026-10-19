// lib/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import filtersReducer from "@/redux/slices/filtersSlice";
import cartReducer from "@/redux/slices/cartSlice";
import authReducer from "@/redux/slices/authSlice";
import orderReducer from "@/redux/slices/orderSlice";
import { loadCartFromStorage } from "@/redux/slices/cartSlice";

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    cart: cartReducer,
    auth: authReducer,
    order: orderReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});
// 🟢 Cargar el carrito desde localStorage al iniciar la aplicación
store.dispatch(loadCartFromStorage());

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
