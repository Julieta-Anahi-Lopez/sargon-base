import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScrollToTop from '@/app/components/ScrollToTop';

describe('ScrollToTop', () => {
  const originalScrollY = window.scrollY;
  const originalScrollTo = window.scrollTo;

  beforeEach(() => {
    // Mock scrollTo
    window.scrollTo = jest.fn();

    // Reset scrollY
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    Object.defineProperty(window, 'scrollY', {
      value: originalScrollY,
      writable: true,
    });
  });

  describe('visibilidad', () => {
    it('debería estar oculto inicialmente (scroll = 0)', () => {
      render(<ScrollToTop />);

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveClass('opacity-0');
      expect(button).toHaveClass('pointer-events-none');
    });

    it('debería aparecer cuando scroll > threshold (400px por defecto)', () => {
      render(<ScrollToTop />);

      // Simular scroll
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
        fireEvent.scroll(window);
      });

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveClass('opacity-100');
      expect(button).not.toHaveClass('pointer-events-none');
    });

    it('debería ocultarse cuando scroll vuelve a ser menor que threshold', () => {
      render(<ScrollToTop />);

      // Scroll hacia abajo
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
        fireEvent.scroll(window);
      });

      // Scroll hacia arriba
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
        fireEvent.scroll(window);
      });

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveClass('opacity-0');
    });

    it('debería respetar threshold personalizado', () => {
      render(<ScrollToTop threshold={200} />);

      // Scroll menor que threshold personalizado
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
        fireEvent.scroll(window);
      });

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveClass('opacity-0');

      // Scroll mayor que threshold personalizado
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 250, writable: true });
        fireEvent.scroll(window);
      });

      expect(button).toHaveClass('opacity-100');
    });
  });

  describe('funcionalidad', () => {
    it('debería llamar scrollTo al hacer clic', async () => {
      const user = userEvent.setup();
      render(<ScrollToTop />);

      // Hacer visible el botón
      act(() => {
        Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
        fireEvent.scroll(window);
      });

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      await user.click(button);

      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  describe('accesibilidad', () => {
    it('debería tener aria-label', () => {
      render(<ScrollToTop />);

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveAttribute('aria-label', 'Volver arriba');
    });

    it('debería tener title para tooltip', () => {
      render(<ScrollToTop />);

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveAttribute('title', 'Volver arriba');
    });
  });

  describe('estilos', () => {
    it('debería tener posición fixed', () => {
      render(<ScrollToTop />);

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveClass('fixed');
    });

    it('debería estar posicionado en la esquina inferior izquierda', () => {
      render(<ScrollToTop />);

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveClass('bottom-20');
      expect(button).toHaveClass('left-4');
    });

    it('debería tener z-index alto', () => {
      render(<ScrollToTop />);

      const button = screen.getByRole('button', { name: 'Volver arriba' });
      expect(button).toHaveClass('z-50');
    });
  });

  describe('limpieza', () => {
    it('debería limpiar event listener al desmontar', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<ScrollToTop />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });
});
