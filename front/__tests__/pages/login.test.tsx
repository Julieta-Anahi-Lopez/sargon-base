import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import cartReducer from '@/redux/slices/cartSlice';
import LoginPage from '@/app/(auth)/login/page';

// Mockear react-redux para controlar useDispatch y useSelector
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn((fn: (state: unknown) => unknown) =>
    fn({
      auth: {
        isAuthenticated: false,
        loading: false,
        error: null,
        initialized: true,
      },
    })
  ),
}));

function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const store = configureStore({
    reducer: { auth: authReducer, cart: cartReducer },
    preloadedState,
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado de campos', () => {
    it('debería renderizar el campo email', () => {
      renderWithStore(<LoginPage />);
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    });

    it('debería renderizar el campo contraseña', () => {
      renderWithStore(<LoginPage />);
      // Usar el id del input directamente para evitar ambigüedad con el botón toggle
      expect(document.getElementById('clave')).toBeInTheDocument();
    });

    it('el campo contraseña debería ser de tipo password por defecto', () => {
      renderWithStore(<LoginPage />);
      expect(document.getElementById('clave')).toHaveAttribute('type', 'password');
    });

    it('debería renderizar el botón Ingresar', () => {
      renderWithStore(<LoginPage />);
      expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
    });
  });

  describe('toggle de visibilidad de contraseña', () => {
    it('al hacer click en el ojito, el campo cambia a tipo text', () => {
      renderWithStore(<LoginPage />);

      const toggleBtn = screen.getByRole('button', { name: /mostrar contraseña/i });
      fireEvent.click(toggleBtn);

      expect(document.getElementById('clave')).toHaveAttribute('type', 'text');
    });

    it('al hacer click de nuevo en el ojito, vuelve a tipo password', () => {
      renderWithStore(<LoginPage />);

      const toggleBtn = screen.getByRole('button', { name: /mostrar contraseña/i });
      fireEvent.click(toggleBtn);
      // En este punto el aria-label cambia a "Ocultar contraseña"
      const toggleBtnOcultar = screen.getByRole('button', { name: /ocultar contraseña/i });
      fireEvent.click(toggleBtnOcultar);

      expect(document.getElementById('clave')).toHaveAttribute('type', 'password');
    });
  });

  describe('envío del formulario', () => {
    it('al enviar el formulario vacío no debería crashear', () => {
      const { container } = renderWithStore(<LoginPage />);
      const form = container.querySelector('form')!;

      expect(() => {
        fireEvent.submit(form);
      }).not.toThrow();
    });
  });

  describe('contenido removido', () => {
    it('no debería renderizar un link a /registro', () => {
      renderWithStore(<LoginPage />);

      const links = screen.queryAllByRole('link');
      const registroLink = links.find((link) =>
        link.getAttribute('href')?.includes('/registro')
      );
      expect(registroLink).toBeUndefined();
    });
  });

  describe('contenido de soporte', () => {
    it('debería renderizar el texto "Contactá a tu vendedor"', () => {
      renderWithStore(<LoginPage />);
      expect(screen.getByText(/contactá a tu vendedor/i)).toBeInTheDocument();
    });
  });

  describe('recuperación de contraseña', () => {
    it('debería renderizar el link "¿Olvidaste tu contraseña?"', () => {
      renderWithStore(<LoginPage />);
      expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument();
    });

    it('el link de recuperación debería apuntar a /recuperar-password', () => {
      renderWithStore(<LoginPage />);
      const link = screen.getByRole('link', { name: /olvidaste tu contraseña/i });
      expect(link).toHaveAttribute('href', '/recuperar-password');
    });
  });
});
