import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '@/redux/slices/cartSlice';
import ProductCard from '@/app/components/ProductCard';

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('ProductCard', () => {
  const mockProduct = {
    id: '001',
    codigo: '001',
    nombre: 'PRODUCTO DE PRUEBA',
    observ: 'Descripción del producto de prueba',
    precio_final: 1500.50,
    stock: 10,
    imagenes: [{ foto_1: '/test-image.jpg' }],
  };

  const mockProductLowStock = {
    ...mockProduct,
    codigo: '002',
    stock: 3,
  };

  const mockProductNoStock = {
    ...mockProduct,
    codigo: '003',
    stock: 0,
  };

  const createMockStore = (initialState = {}) =>
    configureStore({
      reducer: {
        cart: cartReducer,
      },
      preloadedState: {
        cart: { items: [], ...initialState },
      },
    });

  const renderWithProvider = (
    component: React.ReactElement,
    store = createMockStore()
  ) => {
    return render(<Provider store={store}>{component}</Provider>);
  };

  describe('renderizado básico', () => {
    it('debería renderizar el código del producto como badge', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      expect(screen.getByText('001')).toBeInTheDocument();
    });

    it('debería renderizar el nombre del producto normalizado', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      // El nombre se normaliza: primera letra mayúscula, resto minúscula
      expect(screen.getByText('Producto de prueba')).toBeInTheDocument();
    });

    it('debería renderizar el precio formateado', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      // Precio: 1500.50 → $1.500,50
      expect(screen.getByText('$1.500,50')).toBeInTheDocument();
    });

    it('debería renderizar la imagen del producto', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('debería renderizar el botón "Más Info"', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      expect(screen.getByText('Más Info')).toBeInTheDocument();
    });
  });

  describe('estado de stock', () => {
    it('no debería mostrar mensaje de stock cuando hay suficiente', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      expect(screen.queryByText('Sin stock')).not.toBeInTheDocument();
      expect(screen.queryByText('¡Quedan pocos!')).not.toBeInTheDocument();
    });

    it('debería mostrar "¡Quedan pocos!" cuando stock <= 5', () => {
      renderWithProvider(
        <ProductCard product={mockProductLowStock} isAuthenticated={true} />
      );

      expect(screen.getByText('¡Quedan pocos!')).toBeInTheDocument();
    });

    it('debería mostrar "Sin stock" cuando stock es 0', () => {
      renderWithProvider(
        <ProductCard product={mockProductNoStock} isAuthenticated={true} />
      );

      expect(screen.getByText('Sin stock')).toBeInTheDocument();
    });
  });

  describe('selector de cantidad', () => {
    it('debería mostrar cantidad inicial de 1', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(1);
    });

    it('debería incrementar cantidad al hacer clic en +', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      const plusButton = screen.getByLabelText('Aumentar cantidad');
      await user.click(plusButton);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(2);
    });

    it('debería decrementar cantidad al hacer clic en -', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      // Primero incrementar a 2
      const plusButton = screen.getByLabelText('Aumentar cantidad');
      await user.click(plusButton);

      // Luego decrementar
      const minusButton = screen.getByLabelText('Disminuir cantidad');
      await user.click(minusButton);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(1);
    });

    it('no debería permitir cantidad menor a 1', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      const minusButton = screen.getByLabelText('Disminuir cantidad');
      await user.click(minusButton);
      await user.click(minusButton);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(1);
    });

    it('debería deshabilitar controles cuando no está autenticado', () => {
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={false} />
      );

      const input = screen.getByRole('spinbutton');
      const plusButton = screen.getByLabelText('Aumentar cantidad');
      const minusButton = screen.getByLabelText('Disminuir cantidad');

      expect(input).toBeDisabled();
      expect(plusButton).toBeDisabled();
      expect(minusButton).toBeDisabled();
    });

    it('debería deshabilitar controles cuando no hay stock', () => {
      renderWithProvider(
        <ProductCard product={mockProductNoStock} isAuthenticated={true} />
      );

      const input = screen.getByRole('spinbutton');
      const plusButton = screen.getByLabelText('Aumentar cantidad');
      const minusButton = screen.getByLabelText('Disminuir cantidad');

      expect(input).toBeDisabled();
      expect(plusButton).toBeDisabled();
      expect(minusButton).toBeDisabled();
    });
  });

  describe('agregar al carrito', () => {
    it('debería agregar producto al carrito al hacer clic', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />,
        store
      );

      // Buscar el botón de agregar (tiene el ícono ShoppingCart)
      const addButton = screen.getByTitle('Agregar al carrito');
      await user.click(addButton);

      // Verificar que se agregó al store
      const state = store.getState();
      expect(state.cart.items).toHaveLength(1);
      expect(state.cart.items[0].codigo).toBe('001');
    });

    it('debería agregar cantidad correcta al carrito', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />,
        store
      );

      // Incrementar cantidad a 3
      const plusButton = screen.getByLabelText('Aumentar cantidad');
      await user.click(plusButton);
      await user.click(plusButton);

      // Agregar al carrito
      const addButton = screen.getByTitle('Agregar al carrito');
      await user.click(addButton);

      const state = store.getState();
      expect(state.cart.items[0].cantidad).toBe(3);
    });

    it('debería mostrar toast después de agregar', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      const addButton = screen.getByTitle('Agregar al carrito');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Producto agregado al carrito')).toBeInTheDocument();
      });
    });

    it('debería resetear cantidad a 1 después de agregar', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      // Incrementar a 3
      const plusButton = screen.getByLabelText('Aumentar cantidad');
      await user.click(plusButton);
      await user.click(plusButton);

      // Agregar
      const addButton = screen.getByTitle('Agregar al carrito');
      await user.click(addButton);

      // Verificar que se reseteó
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(1);
    });

    it('debería mostrar mensaje de login cuando no está autenticado', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={false} />
      );

      const addButton = screen.getByTitle('Iniciá sesión para agregar productos');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Iniciá sesión para comenzar tu pedido')).toBeInTheDocument();
      });
    });
  });

  describe('modal de información', () => {
    it('debería abrir el modal al hacer clic en "Más Info"', async () => {
      const user = userEvent.setup();
      renderWithProvider(
        <ProductCard product={mockProduct} isAuthenticated={true} />
      );

      const infoButton = screen.getByText('Más Info');
      await user.click(infoButton);

      // El modal debería mostrar el título del producto
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Producto de prueba/i })).toBeInTheDocument();
      });
    });
  });

  describe('imagen fallback', () => {
    it('debería usar imagen fallback cuando no hay imagen', () => {
      const productSinImagen = {
        ...mockProduct,
        imagenes: [],
      };

      renderWithProvider(
        <ProductCard product={productSinImagen} isAuthenticated={true} />
      );

      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', '/Caja.webp');
    });
  });
});
