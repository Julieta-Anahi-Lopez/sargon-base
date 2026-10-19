export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center">
        <div className="flex space-x-2 mb-4">
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Cargando...</p>
      </div>
    </div>
  );
}
