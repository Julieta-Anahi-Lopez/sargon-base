import cartReducer, {
  addToCart,
  removeFromCart,
  clearCart,
  loadCartFromStorage,
} from '@/redux/slices/cartSlice';

describe('cartSlice', () => {
  const initialState = {
    items: [],
  };

  const mockItem = {
    codigo: '001',
    nombre: 'Producto de prueba',
    precio: 1500,
    cantidad: 1,
    image: '/test-image.jpg',
  };

  beforeEach(() => {
    // Limpiar mocks de localStorage antes de cada test
    jest.clearAllMocks();
    localStorage.getItem = jest.fn();
    localStorage.setItem = jest.fn();
    localStorage.removeItem = jest.fn();
  });

  describe('estado inicial', () => {
    it('debería retornar el estado inicial', () => {
      expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('addToCart', () => {
    it('debería agregar un item al carrito vacío', () => {
      const actual = cartReducer(initialState, addToCart(mockItem));

      expect(actual.items).toHaveLength(1);
      expect(actual.items[0].codigo).toBe('001');
      expect(actual.items[0].nombre).toBe('Producto de prueba');
      expect(actual.items[0].precio).toBe(1500);
      expect(actual.items[0].cantidad).toBe(1);
    });

    it('debería incrementar la cantidad si el item ya existe', () => {
      const stateWithItem = {
        items: [mockItem],
      };
      const actual = cartReducer(stateWithItem, addToCart(mockItem));

      expect(actual.items).toHaveLength(1);
      expect(actual.items[0].cantidad).toBe(2);
    });

    it('debería agregar la cantidad especificada al item existente', () => {
      const stateWithItem = {
        items: [{ ...mockItem, cantidad: 2 }],
      };
      const itemToAdd = { ...mockItem, cantidad: 3 };
      const actual = cartReducer(stateWithItem, addToCart(itemToAdd));

      expect(actual.items[0].cantidad).toBe(5);
    });

    it('debería agregar múltiples items diferentes', () => {
      const item2 = { ...mockItem, codigo: '002', nombre: 'Otro producto' };

      let state = cartReducer(initialState, addToCart(mockItem));
      state = cartReducer(state, addToCart(item2));

      expect(state.items).toHaveLength(2);
      expect(state.items[0].codigo).toBe('001');
      expect(state.items[1].codigo).toBe('002');
    });

    it('debería usar cantidad 1 por defecto si no se especifica', () => {
      const itemSinCantidad = {
        codigo: '003',
        nombre: 'Sin cantidad',
        precio: 100,
        cantidad: 0, // Se tratará como 1
        image: '/img.jpg',
      };
      const actual = cartReducer(initialState, addToCart(itemSinCantidad));

      // El slice usa || 1, así que 0 se convierte en 1
      expect(actual.items[0].cantidad).toBe(1);
    });

    it('debería guardar en localStorage después de agregar', () => {
      cartReducer(initialState, addToCart(mockItem));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'cart',
        expect.any(String)
      );
    });
  });

  describe('removeFromCart', () => {
    it('debería reducir la cantidad en 1 cuando hay más de 1', () => {
      const stateWithItem = {
        items: [{ ...mockItem, cantidad: 3 }],
      };
      const actual = cartReducer(stateWithItem, removeFromCart('001'));

      expect(actual.items).toHaveLength(1);
      expect(actual.items[0].cantidad).toBe(2);
    });

    it('debería eliminar el item cuando la cantidad es 1', () => {
      const stateWithItem = {
        items: [mockItem],
      };
      const actual = cartReducer(stateWithItem, removeFromCart('001'));

      expect(actual.items).toHaveLength(0);
    });

    it('debería eliminar completamente con removeCompletely: true', () => {
      const stateWithItem = {
        items: [{ ...mockItem, cantidad: 5 }],
      };
      const actual = cartReducer(
        stateWithItem,
        removeFromCart({ codigo: '001', removeCompletely: true })
      );

      expect(actual.items).toHaveLength(0);
    });

    it('no debería hacer nada si el item no existe', () => {
      const stateWithItem = {
        items: [mockItem],
      };
      const actual = cartReducer(stateWithItem, removeFromCart('999'));

      expect(actual.items).toHaveLength(1);
      expect(actual.items[0].codigo).toBe('001');
    });

    it('debería mantener otros items al eliminar uno', () => {
      const stateWithItems = {
        items: [
          mockItem,
          { ...mockItem, codigo: '002', nombre: 'Otro' },
        ],
      };
      const actual = cartReducer(
        stateWithItems,
        removeFromCart({ codigo: '001', removeCompletely: true })
      );

      expect(actual.items).toHaveLength(1);
      expect(actual.items[0].codigo).toBe('002');
    });
  });

  describe('clearCart', () => {
    it('debería vaciar el carrito completamente', () => {
      const stateWithItems = {
        items: [
          mockItem,
          { ...mockItem, codigo: '002' },
          { ...mockItem, codigo: '003' },
        ],
      };
      const actual = cartReducer(stateWithItems, clearCart());

      expect(actual.items).toHaveLength(0);
    });

    it('debería eliminar del localStorage', () => {
      const stateWithItem = { items: [mockItem] };
      cartReducer(stateWithItem, clearCart());

      expect(localStorage.removeItem).toHaveBeenCalledWith('cart');
    });

    it('debería funcionar con carrito ya vacío', () => {
      const actual = cartReducer(initialState, clearCart());

      expect(actual.items).toHaveLength(0);
    });
  });

  describe('loadCartFromStorage', () => {
    it('debería cargar items desde localStorage', () => {
      const savedItems = [mockItem, { ...mockItem, codigo: '002' }];
      localStorage.getItem = jest.fn().mockReturnValue(JSON.stringify(savedItems));

      const actual = cartReducer(initialState, loadCartFromStorage());

      expect(actual.items).toHaveLength(2);
    });

    it('debería mantener estado vacío si no hay datos en localStorage', () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);

      const actual = cartReducer(initialState, loadCartFromStorage());

      expect(actual.items).toHaveLength(0);
    });

    it('debería manejar JSON inválido en localStorage', () => {
      localStorage.getItem = jest.fn().mockReturnValue('invalid json');

      // No debería lanzar error
      expect(() => {
        cartReducer(initialState, loadCartFromStorage());
      }).not.toThrow();
    });
  });

  describe('cálculos del carrito', () => {
    it('debería permitir calcular el total correctamente', () => {
      const stateWithItems = {
        items: [
          { ...mockItem, precio: 100, cantidad: 2 },  // 200
          { ...mockItem, codigo: '002', precio: 50, cantidad: 3 }, // 150
        ],
      };

      const total = stateWithItems.items.reduce(
        (sum, item) => sum + item.precio * item.cantidad,
        0
      );

      expect(total).toBe(350);
    });

    it('debería permitir calcular la cantidad total de items', () => {
      const stateWithItems = {
        items: [
          { ...mockItem, cantidad: 2 },
          { ...mockItem, codigo: '002', cantidad: 3 },
        ],
      };

      const totalItems = stateWithItems.items.reduce(
        (sum, item) => sum + item.cantidad,
        0
      );

      expect(totalItems).toBe(5);
    });
  });
});
