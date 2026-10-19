"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LoginPrompt() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 3000); // mostrar después de 3s

    return () => clearTimeout(timeout);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-md px-5 py-3 max-w-sm w-full flex items-start sm:items-center justify-between gap-3 text-sm sm:text-base">
      <span className="flex-1">
        Inicia sesión para ver los <strong>precios</strong> de los productos.
      </span>
      <Link
        href="/login"
        className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition whitespace-nowrap"
      >
        Iniciar sesión
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 text-gray-500 hover:text-gray-700 text-lg leading-none"
        aria-label="Cerrar"
      >
        &times;
      </button>
    </div>
  );
}
