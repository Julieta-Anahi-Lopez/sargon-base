import filtersReducer, {
  setCategory,
  setFilters,
} from '@/redux/slices/filtersSlice';

describe('filtersSlice', () => {
  const initialState = {
    category: null,
    subcategory: null,
    precio_max: null,
    nromar: null,
    codigo: null,
    nombre: null,
  };

  describe('estado inicial', () => {
    it('debería retornar el estado inicial', () => {
      expect(filtersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('todos los filtros deberían ser null inicialmente', () => {
      const state = filtersReducer(undefined, { type: 'unknown' });
      Object.values(state).forEach(value => {
        expect(value).toBeNull();
      });
    });
  });

  describe('setCategory', () => {
    it('debería establecer una categoría', () => {
      const actual = filtersReducer(
        initialState,
        setCategory({ category: 'Limpieza' })
      );

      expect(actual.category).toBe('Limpieza');
      expect(actual.subcategory).toBeNull();
    });

    it('debería establecer categoría con subcategoría', () => {
      const actual = filtersReducer(
        initialState,
        setCategory({ category: 'Limpieza', subcategory: 'Ceras' })
      );

      expect(actual.category).toBe('Limpieza');
      expect(actual.subcategory).toBe('Ceras');
    });

    it('debería limpiar subcategoría al cambiar categoría sin especificarla', () => {
      const stateWithSubcategory = {
        ...initialState,
        category: 'Limpieza',
        subcategory: 'Ceras',
      };
      const actual = filtersReducer(
        stateWithSubcategory,
        setCategory({ category: 'Herramientas' })
      );

      expect(actual.category).toBe('Herramientas');
      expect(actual.subcategory).toBeNull();
    });

    it('debería mantener otros filtros al cambiar categoría', () => {
      const stateWithFilters = {
        ...initialState,
        category: 'Limpieza',
        nromar: '001',
        precio_max: 5000,
      };
      const actual = filtersReducer(
        stateWithFilters,
        setCategory({ category: 'Herramientas' })
      );

      expect(actual.category).toBe('Herramientas');
      expect(actual.nromar).toBe('001');
      expect(actual.precio_max).toBe(5000);
    });
  });

  describe('setFilters', () => {
    it('debería establecer múltiples filtros a la vez', () => {
      const actual = filtersReducer(
        initialState,
        setFilters({
          nromar: '001',
          precio_max: 5000,
          nombre: 'cera',
        })
      );

      expect(actual.nromar).toBe('001');
      expect(actual.precio_max).toBe(5000);
      expect(actual.nombre).toBe('cera');
    });

    it('debería actualizar solo los filtros especificados', () => {
      const stateWithFilters = {
        ...initialState,
        category: 'Limpieza',
        nromar: '001',
      };
      const actual = filtersReducer(
        stateWithFilters,
        setFilters({ nromar: '002' })
      );

      expect(actual.category).toBe('Limpieza'); // Mantiene
      expect(actual.nromar).toBe('002'); // Actualiza
    });

    it('debería permitir establecer filtro de código', () => {
      const actual = filtersReducer(
        initialState,
        setFilters({ codigo: 'ABC123' })
      );

      expect(actual.codigo).toBe('ABC123');
    });

    it('debería permitir establecer filtro de nombre', () => {
      const actual = filtersReducer(
        initialState,
        setFilters({ nombre: 'Producto de prueba' })
      );

      expect(actual.nombre).toBe('Producto de prueba');
    });

    it('debería permitir establecer precio_max', () => {
      const actual = filtersReducer(
        initialState,
        setFilters({ precio_max: 10000 })
      );

      expect(actual.precio_max).toBe(10000);
    });

    it('debería permitir limpiar un filtro específico', () => {
      const stateWithFilters = {
        ...initialState,
        nromar: '001',
        nombre: 'test',
      };
      const actual = filtersReducer(
        stateWithFilters,
        setFilters({ nromar: null })
      );

      expect(actual.nromar).toBeNull();
      expect(actual.nombre).toBe('test');
    });

    it('debería permitir limpiar todos los filtros', () => {
      const stateWithFilters = {
        category: '1',
        subcategory: '10',
        precio_max: 5000,
        nromar: '5',
        codigo: 'ABC',
        nombre: 'Producto',
      };
      const actual = filtersReducer(
        stateWithFilters,
        setFilters(initialState)
      );

      expect(actual).toEqual(initialState);
    });
  });

  describe('combinación de acciones', () => {
    it('debería manejar secuencia de setCategory y setFilters', () => {
      let state = filtersReducer(
        initialState,
        setCategory({ category: 'Limpieza', subcategory: 'Ceras' })
      );
      state = filtersReducer(
        state,
        setFilters({ nromar: '001', precio_max: 5000 })
      );

      expect(state.category).toBe('Limpieza');
      expect(state.subcategory).toBe('Ceras');
      expect(state.nromar).toBe('001');
      expect(state.precio_max).toBe(5000);
    });

    it('debería manejar múltiples actualizaciones de filtros', () => {
      let state = filtersReducer(initialState, setFilters({ nombre: 'test' }));
      state = filtersReducer(state, setFilters({ codigo: 'ABC' }));
      state = filtersReducer(state, setFilters({ nombre: 'actualizado' }));

      expect(state.nombre).toBe('actualizado');
      expect(state.codigo).toBe('ABC');
    });
  });

  describe('utilidades para verificar filtros activos', () => {
    it('debería poder detectar si hay filtros activos', () => {
      const stateWithFilters = {
        ...initialState,
        category: '1',
      };

      const hasActiveFilters = Object.values(stateWithFilters).some(
        value => value !== null && value !== undefined && value !== ''
      );

      expect(hasActiveFilters).toBe(true);
    });

    it('debería detectar estado sin filtros activos', () => {
      const hasActiveFilters = Object.values(initialState).some(
        value => value !== null && value !== undefined && value !== ''
      );

      expect(hasActiveFilters).toBe(false);
    });

    it('debería contar filtros activos correctamente', () => {
      const stateWithFilters = {
        category: '1',
        subcategory: '10',
        precio_max: 5000,
        nromar: null,
        codigo: null,
        nombre: null,
      };

      const activeFilterCount = Object.values(stateWithFilters).filter(
        value => value !== null && value !== undefined && value !== ''
      ).length;

      expect(activeFilterCount).toBe(3);
    });
  });
});
