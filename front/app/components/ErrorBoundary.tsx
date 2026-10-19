"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary reutilizable para capturar errores en componentes específicos
 *
 * Uso:
 * <ErrorBoundary>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 *
 * Con fallback personalizado:
 * <ErrorBoundary fallback={<MiComponenteDeError />}>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error capturado por el boundary
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar este contenido
          </h3>
          <p className="text-gray-600 text-sm mb-4 text-center">
            Ocurrió un problema al mostrar esta sección.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
