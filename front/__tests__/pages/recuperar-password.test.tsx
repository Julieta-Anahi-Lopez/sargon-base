import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecuperarPasswordPage from '@/app/(auth)/recuperar-password/page';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RecuperarPasswordPage', () => {
  describe('renderizado inicial', () => {
    it('debería mostrar el campo de email', () => {
      render(<RecuperarPasswordPage />);
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    });

    it('debería mostrar el botón de envío', () => {
      render(<RecuperarPasswordPage />);
      expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
    });

    it('debería mostrar el link "Volver al login"', () => {
      render(<RecuperarPasswordPage />);
      const link = screen.getByRole('link', { name: /volver al login/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/login');
    });

    it('debería mostrar el título de la página', () => {
      render(<RecuperarPasswordPage />);
      expect(screen.getByText(/olvidaste tu contraseña/i)).toBeInTheDocument();
    });
  });

  describe('envío del formulario', () => {
    it('debería mostrar el estado de éxito tras una respuesta OK', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'ok' }),
      });

      const { container } = render(<RecuperarPasswordPage />);

      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'cliente@test.com' },
      });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/revisá tu correo/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar el email ingresado en el mensaje de éxito', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { container } = render(<RecuperarPasswordPage />);

      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'mimail@ejemplo.com' },
      });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/mimail@ejemplo\.com/)).toBeInTheDocument();
      });
    });

    it('debería mostrar el error recibido del servidor cuando falla', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Servidor no disponible' }),
      });

      const { container } = render(<RecuperarPasswordPage />);

      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'test@test.com' },
      });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/servidor no disponible/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error genérico cuando falla la red', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { container } = render(<RecuperarPasswordPage />);

      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'test@test.com' },
      });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/no se pudo conectar/i)).toBeInTheDocument();
      });
    });

    it('debería llamar al endpoint correcto con el email en minúsculas', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { container } = render(<RecuperarPasswordPage />);

      fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
        target: { value: 'UPPER@EXAMPLE.COM' },
      });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/password-reset/'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'upper@example.com' }),
          })
        );
      });
    });

    it('no debería mostrar el estado de éxito antes de enviar', () => {
      render(<RecuperarPasswordPage />);
      expect(screen.queryByText(/revisá tu correo/i)).not.toBeInTheDocument();
    });
  });
});
