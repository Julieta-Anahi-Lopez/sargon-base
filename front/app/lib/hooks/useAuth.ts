"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { initializeAuth, logout } from "@/redux/slices/authSlice";
import { clearCart } from "@/redux/slices/cartSlice";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.initialized) {
      dispatch(initializeAuth());
    }
  }, [auth.initialized, dispatch]);

  function handleLogout() {
    dispatch(logout());
    dispatch(clearCart());
    document.cookie = "auth_token=; path=/; max-age=0";
  }

  return {
    user:            auth.user,
    token:           auth.token,
    isAuthenticated: auth.isAuthenticated,
    authChecked:     auth.initialized,
    logout:          handleLogout,
  };
}

/** Función de logout standalone para el apiService */
export function logoutGlobal() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  document.cookie = "auth_token=; path=/; max-age=0";
}
