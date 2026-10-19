import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/app/components/Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Título del producto',
    description: 'Descripción del producto',
    codigo: 'ABC123',
    children: <div>Contenido del modal</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado', () => {
    it('no debería renderizar cuando isOpen es false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Título del producto')).not.toBeInTheDocument();
    });

    it('debería renderizar cuando isOpen es true', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Título del producto')).toBeInTheDocument();
    });

    it('debería renderizar el código como badge', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });

    it('debería renderizar la descripción', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Descripción del producto')).toBeInTheDocument();
    });

    it('debería renderizar el children', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
    });

    it('debería renderizar el botón cerrar', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
    });

    it('debería renderizar el botón "Cerrar" en el footer', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    });
  });

  describe('stock status', () => {
    it('debería mostrar "Disponible" cuando hay stock suficiente', () => {
      render(<Modal {...defaultProps} stock={10} />);

      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('debería mostrar "¡Quedan pocos!" cuando stock <= 5', () => {
      render(<Modal {...defaultProps} stock={3} />);

      expect(screen.getByText('¡Quedan pocos!')).toBeInTheDocument();
    });

    it('debería mostrar "Sin stock" cuando stock es 0', () => {
      render(<Modal {...defaultProps} stock={0} />);

      expect(screen.getByText('Sin stock')).toBeInTheDocument();
    });

    it('no debería mostrar badge de stock si no se proporciona', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.queryByText('Disponible')).not.toBeInTheDocument();
      expect(screen.queryByText('Sin stock')).not.toBeInTheDocument();
    });
  });

  describe('precio', () => {
    it('debería mostrar el precio formateado cuando se proporciona', () => {
      render(<Modal {...defaultProps} precio={1500.50} />);

      expect(screen.getByText('$1.500,50')).toBeInTheDocument();
      expect(screen.getByText('por unidad')).toBeInTheDocument();
    });

    it('no debería mostrar sección de precio si no se proporciona', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.queryByText('por unidad')).not.toBeInTheDocument();
    });
  });

  describe('botón agregar al carrito', () => {
    it('debería mostrar botón cuando onAddToCart está definido', () => {
      const onAddToCart = jest.fn();
      render(
        <Modal {...defaultProps} onAddToCart={onAddToCart} isAuthenticated={true} />
      );

      expect(screen.getByText('Agregar al carrito')).toBeInTheDocument();
    });

    it('debería llamar onAddToCart al hacer clic', async () => {
      const user = userEvent.setup();
      const onAddToCart = jest.fn();
      render(
        <Modal {...defaultProps} onAddToCart={onAddToCart} isAuthenticated={true} stock={10} />
      );

      await user.click(screen.getByText('Agregar al carrito'));

      expect(onAddToCart).toHaveBeenCalledWith(1);
    });

    it('debería deshabilitar botón cuando no está autenticado', () => {
      const onAddToCart = jest.fn();
      render(
        <Modal {...defaultProps} onAddToCart={onAddToCart} isAuthenticated={false} />
      );

      expect(screen.getByText('Agregar al carrito')).toBeDisabled();
    });

    it('debería deshabilitar botón cuando no hay stock', () => {
      const onAddToCart = jest.fn();
      render(
        <Modal {...defaultProps} onAddToCart={onAddToCart} isAuthenticated={true} stock={0} />
      );

      expect(screen.getByText('Agregar al carrito')).toBeDisabled();
    });

    it('no debería mostrar botón cuando onAddToCart no está definido', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.queryByText('Agregar al carrito')).not.toBeInTheDocument();
    });
  });

  describe('cerrar modal', () => {
    it('debería llamar onClose al hacer clic en X', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByLabelText('Cerrar'));

      expect(onClose).toHaveBeenCalled();
    });

    it('debería llamar onClose al hacer clic en botón Cerrar', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Cerrar' }));

      expect(onClose).toHaveBeenCalled();
    });

    it('debería llamar onClose al hacer clic en el backdrop', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      // El backdrop es el primer div con la clase fixed
      const backdrop = document.querySelector('.fixed.inset-0');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('debería llamar onClose al presionar Escape', async () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('no debería cerrar al hacer clic dentro del modal', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByText('Título del producto'));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('accesibilidad', () => {
    it('debería bloquear scroll del body cuando está abierto', () => {
      render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('debería restaurar scroll del body cuando se cierra', () => {
      const { rerender } = render(<Modal {...defaultProps} />);

      rerender(<Modal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('unset');
    });

    it('debería tener aria-label en el botón cerrar', () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Cerrar');
      expect(closeButton).toBeInTheDocument();
    });
  });
});
