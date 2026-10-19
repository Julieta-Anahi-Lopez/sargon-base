import Link from "next/link";
import { Search, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
            <Search className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-amber-600 mb-2">404</h1>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Página no encontrada
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          La página que buscás no existe o fue movida a otra ubicación.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al inicio
          </Link>

          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
