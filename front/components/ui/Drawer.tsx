"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface Props {
  open:     boolean;
  onClose:  () => void;
  title?:   string;
  children: React.ReactNode;
  width?:   string;
  side?:    "right" | "left" | "bottom";
}

export function Drawer({ open, onClose, title, children, width = "w-full sm:w-[420px]", side = "right" }: Props) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!open) return null;

  const panelBase = "fixed z-50 flex flex-col bg-brand-light shadow-drawer";
  const sideClass = {
    right:  `top-0 right-0 h-full ${width}`,
    left:   `top-0 left-0 h-full ${width}`,
    bottom: "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl",
  }[side];

  const animation = {
    right:  "drawer-enter",
    left:   "drawer-enter",
    bottom: "drawer-enter",
  }[side];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className={`${panelBase} ${sideClass} ${animation}`} role="dialog" aria-modal>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand/20">
          {title && <h2 className="text-base font-semibold text-brand">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-md text-brand/60 hover:text-brand hover:bg-brand/10 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
