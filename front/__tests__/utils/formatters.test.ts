/**
 * Tests para funciones de formateo usadas en la aplicación
 * Estas funciones están duplicadas aquí porque son internas de los componentes
 * En un refactor futuro, deberían extraerse a un archivo de utilidades
 */

describe('Funciones de formateo', () => {
  // Función normalizeText (usada en ProductCard)
  const normalizeText = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Función formatPrice (usada en ProductCard y Modal)
  const formatPrice = (price: number): string => {
    const fixed = price.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInt},${decPart}`;
  };

  describe('normalizeText', () => {
    it('debería capitalizar la primera letra y poner el resto en minúsculas', () => {
      expect(normalizeText('PRODUCTO DE PRUEBA')).toBe('Producto de prueba');
    });

    it('debería manejar texto ya capitalizado', () => {
      expect(normalizeText('Producto')).toBe('Producto');
    });

    it('debería manejar texto en minúsculas', () => {
      expect(normalizeText('producto')).toBe('Producto');
    });

    it('debería retornar cadena vacía para string vacío', () => {
      expect(normalizeText('')).toBe('');
    });

    it('debería manejar una sola letra', () => {
      expect(normalizeText('A')).toBe('A');
      expect(normalizeText('a')).toBe('A');
    });

    it('debería manejar texto con números', () => {
      expect(normalizeText('PRODUCTO 123')).toBe('Producto 123');
    });

    it('debería manejar texto con caracteres especiales', () => {
      expect(normalizeText('CERA LÍQUIDA')).toBe('Cera líquida');
    });
  });

  describe('formatPrice', () => {
    it('debería formatear precio con separador de miles (punto) y decimales (coma)', () => {
      expect(formatPrice(1500.50)).toBe('1.500,50');
    });

    it('debería manejar precios sin decimales', () => {
      expect(formatPrice(1000)).toBe('1.000,00');
    });

    it('debería manejar precios pequeños', () => {
      expect(formatPrice(5.99)).toBe('5,99');
    });

    it('debería manejar precio 0', () => {
      expect(formatPrice(0)).toBe('0,00');
    });

    it('debería manejar precios grandes', () => {
      expect(formatPrice(1000000.99)).toBe('1.000.000,99');
    });

    it('debería manejar precios con un solo decimal', () => {
      expect(formatPrice(100.5)).toBe('100,50');
    });

    it('debería redondear correctamente', () => {
      expect(formatPrice(99.999)).toBe('100,00');
      expect(formatPrice(99.994)).toBe('99,99');
    });

    it('debería manejar precios negativos', () => {
      // Nota: en la app real probablemente no haya precios negativos
      // pero es bueno probar el comportamiento
      expect(formatPrice(-100)).toBe('-100,00');
    });
  });

  describe('Casos de uso combinados', () => {
    it('debería formatear correctamente un producto típico', () => {
      const producto = {
        nombre: 'CERA PARA PISOS',
        precio: 2599.90,
      };

      expect(normalizeText(producto.nombre)).toBe('Cera para pisos');
      expect(formatPrice(producto.precio)).toBe('2.599,90');
    });
  });
});

describe('Funciones de stock', () => {
  // Función getStockStatus (usada en Modal)
  const getStockStatus = (stock: number | undefined) => {
    if (stock === undefined) return null;
    if (stock <= 0) return { label: 'Sin stock', color: 'bg-red-100 text-red-700' };
    if (stock <= 5) return { label: '¡Quedan pocos!', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Disponible', color: 'bg-green-100 text-green-700' };
  };

  describe('getStockStatus', () => {
    it('debería retornar null si stock es undefined', () => {
      expect(getStockStatus(undefined)).toBeNull();
    });

    it('debería retornar "Sin stock" cuando stock es 0', () => {
      const result = getStockStatus(0);
      expect(result?.label).toBe('Sin stock');
      expect(result?.color).toContain('red');
    });

    it('debería retornar "Sin stock" cuando stock es negativo', () => {
      const result = getStockStatus(-5);
      expect(result?.label).toBe('Sin stock');
    });

    it('debería retornar "¡Quedan pocos!" cuando stock <= 5', () => {
      expect(getStockStatus(1)?.label).toBe('¡Quedan pocos!');
      expect(getStockStatus(3)?.label).toBe('¡Quedan pocos!');
      expect(getStockStatus(5)?.label).toBe('¡Quedan pocos!');
    });

    it('debería retornar "Disponible" cuando stock > 5', () => {
      expect(getStockStatus(6)?.label).toBe('Disponible');
      expect(getStockStatus(100)?.label).toBe('Disponible');
    });

    it('debería incluir clases de color correctas', () => {
      expect(getStockStatus(0)?.color).toContain('red');
      expect(getStockStatus(3)?.color).toContain('amber');
      expect(getStockStatus(10)?.color).toContain('green');
    });
  });
});

describe('Funciones de filtros', () => {
  // Función hasActiveFilters (usada en FiltersPanel)
  const hasActiveFilters = (filters: Record<string, any>) => {
    return Object.values(filters).some(
      value => value !== null && value !== undefined && value !== ''
    );
  };

  // Función countActiveFilters
  const countActiveFilters = (filters: Record<string, any>) => {
    return Object.values(filters).filter(
      value => value !== null && value !== undefined && value !== ''
    ).length;
  };

  const emptyFilters = {
    category: null,
    subcategory: null,
    precio_max: null,
    nromar: null,
    codigo: null,
    nombre: null,
  };

  describe('hasActiveFilters', () => {
    it('debería retornar false cuando todos los filtros son null', () => {
      expect(hasActiveFilters(emptyFilters)).toBe(false);
    });

    it('debería retornar true cuando hay al menos un filtro activo', () => {
      expect(hasActiveFilters({ ...emptyFilters, category: '1' })).toBe(true);
    });

    it('debería ignorar strings vacíos', () => {
      expect(hasActiveFilters({ ...emptyFilters, nombre: '' })).toBe(false);
    });

    it('debería detectar valores numéricos', () => {
      expect(hasActiveFilters({ ...emptyFilters, precio_max: 0 })).toBe(true);
      expect(hasActiveFilters({ ...emptyFilters, precio_max: 100 })).toBe(true);
    });
  });

  describe('countActiveFilters', () => {
    it('debería retornar 0 para filtros vacíos', () => {
      expect(countActiveFilters(emptyFilters)).toBe(0);
    });

    it('debería contar filtros activos correctamente', () => {
      const filters = {
        ...emptyFilters,
        category: '1',
        subcategory: '10',
        precio_max: 5000,
      };
      expect(countActiveFilters(filters)).toBe(3);
    });

    it('debería contar todos los filtros si todos están activos', () => {
      const allFilters = {
        category: '1',
        subcategory: '10',
        precio_max: 5000,
        nromar: '5',
        codigo: 'ABC',
        nombre: 'test',
      };
      expect(countActiveFilters(allFilters)).toBe(6);
    });
  });
});
