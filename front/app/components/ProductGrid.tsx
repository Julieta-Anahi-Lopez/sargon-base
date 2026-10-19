"use client";
import ProductCard from "./ProductCard"

interface Product {
  codigo: string
  nombre: string
  observ: string
  precio_final: number
  stock: number
  imagenes: { foto_1: string }[]
}

interface ProductGridProps {
  products: Product[]
  isAuthenticated: boolean;
}

export default function ProductGrid({ products, isAuthenticated  }: ProductGridProps) {
  return (
    <div className="flex-grow bg-white dark:bg-gray-950 py-4">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-28">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.codigo}
              product={{
                id: product.codigo,
                codigo: product.codigo,
                nombre: product.nombre,
                observ: product.observ,
                precio_final: product.precio_final,
                stock: product.stock,
                imagenes: product.imagenes,
              }}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </div>
    </div>
  )};