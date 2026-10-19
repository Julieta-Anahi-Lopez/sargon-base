export function ProductSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-sm">
      {/* Espejo del acento de esquina */}
      <div className="absolute top-0 left-0 z-10 w-5 h-5 bg-brand" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />

      <div className="skeleton aspect-square rounded-none" />

      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <div className="flex items-center justify-between gap-1">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-4 w-14 rounded-full" />
        </div>
        <div className="skeleton h-3.5 rounded w-full" />
        <div className="skeleton h-3.5 rounded w-3/4" />
        <div className="skeleton h-5 w-20 rounded mt-1" />
        <div className="skeleton h-9 rounded-lg mt-1" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  );
}
