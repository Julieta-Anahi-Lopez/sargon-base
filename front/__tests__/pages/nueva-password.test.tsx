import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import NuevaPasswordPage from '@/app/(auth)/nueva-password/page';

// Override global navigation mock for this file so we can control searchParams
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
  useSearchParams: jest.fn(() => ({ get: jest.fn(() => null) })),
  usePathname: jest.fn(() => '/nueva-password'),
}));

beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
  // Default: no token
  (useSearchParams as jest.Mock).mockReturnValue({ get: () => null });
  (useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() });
});

describe('NuevaPasswordPage', () => {
  describe('sin token en la URL', () => {
    it('debería mostrar mensaje de enlace inválido', () => {
      render(<NuevaPasswordPage />);
      expect(screen.getByText(/inválido o ya fue usado/i)).toBeInTheDocument();
    });

    it('debería mostrar link para solicitar un nuevo enlace', () => {
      render(<NuevaPasswordPage />);
      const link = screen.getByRole('link', { name: /solicitá uno nuevo/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/recuperar-password');
    });

    it('no debería mostrar los campos de contraseña', () => {
      render(<NuevaPasswordPage />);
      expect(document.getElementById('clave')).not.toBeInTheDocument();
    });
  });

  describe('con token en la URL', () => {
    beforeEach(() => {
      (useSearchParams as jest.Mock).mockReturnValue({ get: (key: string) => (key === 'token' ? 'tok-valido' : null) });
    });

    it('debería mostrar el campo de nueva contraseña', () => {
      render(<NuevaPasswordPage />);
      expect(document.getElementById('clave')).toBeInTheDocument();
    });

    it('debería mostrar el campo de confirmación', () => {
      render(<NuevaPasswordPage />);
      expect(document.getElementById('confirm')).toBeInTheDocument();
    });

    it('debería mostrar el botón de guardar', () => {
      render(<NuevaPasswordPage />);
      expect(screen.getByRole('button', { name: /guardar contraseña/i })).toBeInTheDocument();
    });

    it('debería mostrar el toggle de visibilidad de contraseña', () => {
      render(<NuevaPasswordPage />);
      expect(screen.getByRole('button', { name: /mostrar contraseña/i })).toBeInTheDocument();
    });

    it('el toggle debería cambiar el tipo de input a text', () => {
      render(<NuevaPasswordPage />);
      fireEvent.click(screen.getByRole('button', { name: /mostrar contraseña/i }));
      expect(document.getElementById('clave')).toHaveAttribute('type', 'text');
    });

    it('debería mostrar error si la contraseña supera 8 caracteres', async () => {
      const { container } = render(<NuevaPasswordPage />);

      fireEvent.change(document.getElementById('clave')!, { target: { value: 'muylargas' } });
      fireEvent.change(document.getElementById('confirm')!, { target: { value: 'muylargas' } });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/no puede superar los 8 caracteres/i)).toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('debería mostrar error si las contraseñas no coinciden', async () => {
      const { container } = render(<NuevaPasswordPage />);

      fireEvent.change(document.getElementById('clave')!, { target: { value: 'abc123' } });
      fireEvent.change(document.getElementById('confirm')!, { target: { value: 'xyz789' } });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('debería llamar al endpoint de confirmación con el token y la clave', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      const { container } = render(<NuevaPasswordPage />);

      fireEvent.change(document.getElementById('clave')!, { target: { value: 'nueva12' } });
      fireEvent.change(document.getElementById('confirm')!, { target: { value: 'nueva12' } });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/password-reset/confirm/'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ token: 'tok-valido', nueva_clave: 'nueva12' }),
          })
        );
      });
    });

    it('debería mostrar el estado de éxito cuando el servidor responde OK', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      const { container } = render(<NuevaPasswordPage />);

      fireEvent.change(document.getElementById('clave')!, { target: { value: 'nueva12' } });
      fireEvent.change(document.getElementById('confirm')!, { target: { value: 'nueva12' } });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar el error del servidor cuando falla', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'El enlace expiró. Solicitá uno nuevo.' }),
      });

      const { container } = render(<NuevaPasswordPage />);

      fireEvent.change(document.getElementById('clave')!, { target: { value: 'nueva12' } });
      fireEvent.change(document.getElementById('confirm')!, { target: { value: 'nueva12' } });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/el enlace expiró/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar error genérico si falla la red', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network'));

      const { container } = render(<NuevaPasswordPage />);

      fireEvent.change(document.getElementById('clave')!, { target: { value: 'nueva12' } });
      fireEvent.change(document.getElementById('confirm')!, { target: { value: 'nueva12' } });
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => {
        expect(screen.getByText(/no se pudo conectar/i)).toBeInTheDocument();
      });
    });

    it('debería mostrar el link "Volver al login"', () => {
      render(<NuevaPasswordPage />);
      const link = screen.getByRole('link', { name: /volver al login/i });
      expect(link).toHaveAttribute('href', '/login');
    });
  });
});
