// redux/Provider.tsx
"use client";

import { store } from "@/store";
import { Provider } from "react-redux";
import { AuthProvider } from "@/app/components/AuthProvider";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}