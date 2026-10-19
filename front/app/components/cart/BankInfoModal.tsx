"use client";

interface BankInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export default function BankInfoModal({ isOpen, onClose, total }: BankInfoModalProps) {
  if (!isOpen) return null;

  const handleCopyCBU = () => {
    navigator.clipboard.writeText("19101578-55015700970032");
  };

  const handleSendWhatsApp = () => {
    const mensaje = `Hola, acabo de realizar un pedido de $${total.toFixed(
      2
    )}. Adjunto comprobante de transferencia.`;
    window.open(
      `https://wa.me/5492914732827?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-md p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl leading-none"
          aria-label="Cerrar"
        >
          ✖
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Información para el pago</h2>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>Total del pedido:</strong> ${total.toFixed(2)}
          </p>
          <p>
            <strong>Beneficiario: </strong>[DEFINIR].
          </p>
          <p>
            <strong>CBU: </strong>[DEFINIR]
          </p>
          <p>
            <strong>Alias: </strong>[DEFINIR]
          </p>
        </div>

        <button
          onClick={handleCopyCBU}
          className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300 py-2 rounded transition"
        >
          Copiar CBU
        </button>

        <button
          onClick={handleSendWhatsApp}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded transition flex justify-center items-center gap-2"
        >
          <svg
            fill="currentColor"
            viewBox="0 0 32 32"
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16 .396C7.176.396.001 7.57.001 16.396c0 2.907.765 5.65 2.21 8.087L.06 32l7.308-2.14a15.82 15.82 0 008.63 2.536c8.824 0 15.999-7.173 15.999-16S24.824.396 16 .396zM16 29.93c-2.786 0-5.505-.772-7.87-2.237l-.564-.337-4.348 1.272 1.3-4.236-.366-.606a13.88 13.88 0 01-2.068-7.09c0-7.732 6.29-14.02 14.02-14.02S30.02 8.664 30.02 16.396 23.732 29.93 16 29.93zm8.148-10.368c-.447-.223-2.646-1.304-3.057-1.453-.41-.15-.708-.223-1.006.223-.297.446-1.15 1.453-1.41 1.75-.26.297-.518.335-.965.112-.447-.223-1.89-.693-3.6-2.211-1.33-1.19-2.227-2.656-2.488-3.102-.26-.446-.028-.685.195-.908.2-.2.447-.52.67-.78.224-.26.298-.446.447-.743.15-.297.075-.56-.037-.78-.112-.223-1.006-2.42-1.378-3.314-.363-.868-.735-.752-1.006-.766l-.86-.015c-.297 0-.78.112-1.187.56-.41.447-1.56 1.52-1.56 3.706s1.596 4.3 1.817 4.593c.223.297 3.132 4.778 7.595 6.703.63.27 1.12.43 1.505.55.63.2 1.202.172 1.654.105.504-.075 1.56-.637 1.78-1.253.223-.618.223-1.15.15-1.253-.075-.104-.28-.164-.728-.372z" />
          </svg>
          Enviar comprobante
        </button>
      </div>
    </div>
  );
}
