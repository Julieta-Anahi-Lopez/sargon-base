// store.ts
import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import { loadCartFromStorage } from './slices/cartSlice';



export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    cart: cartReducer,
    auth: authReducer,
    order: orderReducer
  },
});

store.dispatch(loadCartFromStorage());

// export type RootState = ReturnType<typeof store.getState>;
// En store.ts
export type RootState = {
  filters: ReturnType<typeof filtersReducer>;
  cart: ReturnType<typeof cartReducer>;
  auth: ReturnType<typeof authReducer>;
  order: ReturnType<typeof orderReducer>;
};
export type AppDispatch = typeof store.dispatch;


// // redux/store.tsx
// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// // Importa otros reducers aquí si los tienes

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     // Añade aquí otros reducers
//   },
// });

// // Tipos para TypeScript
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;