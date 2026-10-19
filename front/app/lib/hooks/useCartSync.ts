"use client";

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setCart } from "@/redux/slices/cartSlice";
import { useAuth } from "@/app/lib/hooks/useAuth";
import { useDebounce } from "@/app/lib/hooks/useDebounce";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useCartSync() {
  const { isAuthenticated, token: authToken } = useAuth();
  const items   = useSelector((s: RootState) => s.cart.items);
  const dispatch = useDispatch();
  const syncedOnLogin = useRef(false);

  // Al login: carga el carrito desde el backend y reemplaza el local.
  useEffect(() => {
    if (!isAuthenticated || !authToken || syncedOnLogin.current) return;
    syncedOnLogin.current = true;

    fetch(`${API_URL}/carrito/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((data: { codart: string; cantid: number; precio: number; nombre: string; stock?: number }[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        dispatch(setCart(data.map((i) => ({
          codigo:   i.codart,
          nombre:   i.nombre,
          precio:   i.precio,
          cantidad: i.cantid,
          image:    "",
          stock:    i.stock,
        }))));
      })
      .catch(() => {});
  }, [isAuthenticated, authToken, dispatch]);

  // Al logout: resetea el flag para que el próximo login vuelva a sincronizar.
  useEffect(() => {
    if (!isAuthenticated) syncedOnLogin.current = false;
  }, [isAuthenticated]);

  // Cuando el carrito cambia: sincroniza al backend (debounced 1.5s).
  const debouncedItems = useDebounce(items, 1500);
  useEffect(() => {
    if (!isAuthenticated || !authToken) return;

    fetch(`${API_URL}/carrito/`, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        debouncedItems.map((i) => ({
          codart: i.codigo,
          cantid: i.cantidad,
          precio: i.precio,
        }))
      ),
    }).catch(() => {});
  }, [debouncedItems, isAuthenticated, authToken]);
}
