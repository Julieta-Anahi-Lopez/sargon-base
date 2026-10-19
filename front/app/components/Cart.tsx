"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";

export default function CartComponent() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  return (
    <div>
      <h2>Carrito de compras</h2>
      {cart.length === 0 && <p>Tu carrito está vacío</p>}
      <ul>
        {cart.map((item) => (
          <li key={item.codigo}>
            {item.nombre} - ${item.precio} x {item.cantidad}
            <button onClick={() => dispatch(removeFromCart(item.codigo))}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => dispatch(addToCart({ codigo: "1", nombre: "Ejemplo", precio: 10, cantidad: 1, image: "" }))}>
        Agregar Producto
      </button>
    </div>
  );
}
