import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NuevoUsuarioPage from '@/app/(private)/vendedor/nuevo-usuario/page';

// Mock de useAuth para simular un vendedor autenticado
jest.mock('@/app/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { catusu: 'V', nombre: 'Vendedor Test' },
    isAuthenticated: true,
    authChecked: true,
    token: 'fake-token',
  }),
}));

// Helpers para completar campos mínimos válidos
function completarCamposMinimos() {
  fireEvent.change(screen.getByLabelText(/nombre completo/i), {
    target: { value: 'Juan García', name: 'nombre' },
  });
  fireEvent.change(screen.getByLabelText(/email \*/i), {
    target: { value: 'juan@ejemplo.com', name: 'e_mail' },
  });
  fireEvent.change(screen.getByLabelText(/dni \*/i), {
    target: { value: '30123456', name: 'nrodoc' },
  });
  fireEvent.change(screen.getByLabelText(/localidad \*/i), {
    target: { value: '8000', name: 'locali' },
  });
}

function clickCrearUsuario() {
  fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));
}

describe('NuevoUsuarioPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('validaciones de formulario', () => {
    it('DNI con letras → debería mostrar error "7 u 8 dígitos"', async () => {
      render(<NuevoUsuarioPage />);
      completarCamposMinimos();

      // Pisar el DNI con un valor inválido
      fireEvent.change(screen.getByLabelText(/dni \*/i), {
        target: { value: 'abc1234', name: 'nrodoc' },
      });
      clickCrearUsuario();

      // El mensaje exacto es "El DNI debe tener 7 u 8 dígitos numéricos."
      await waitFor(() => {
        expect(screen.getByText(/el dni debe tener 7 u 8 dígitos numéricos/i)).toBeInTheDocument();
      });
    });

    it('DNI con más de 8 dígitos → debería mostrar error "7 u 8 dígitos"', async () => {
      render(<NuevoUsuarioPage />);
      completarCamposMinimos();

      fireEvent.change(screen.getByLabelText(/dni \*/i), {
        target: { value: '123456789', name: 'nrodoc' },
      });
      clickCrearUsuario();

      await waitFor(() => {
        expect(screen.getByText(/el dni debe tener 7 u 8 dígitos numéricos/i)).toBeInTheDocument();
      });
    });

    it('email inválido → debería mostrar error "formato del email"', async () => {
      render(<NuevoUsuarioPage />);
      completarCamposMinimos();

      fireEvent.change(screen.getByLabelText(/email \*/i), {
        target: { value: 'email-sin-arroba', name: 'e_mail' },
      });
      clickCrearUsuario();

      await waitFor(() => {
        expect(screen.getByText(/formato del email/i)).toBeInTheDocument();
      });
    });

    it('CUIT obligatorio cuando la categoría IVA es Responsable Inscripto', async () => {
      render(<NuevoUsuarioPage />);
      completarCamposMinimos();

      // Seleccionar Responsable Inscripto (value "1")
      fireEvent.change(screen.getByLabelText(/categoría iva/i), {
        target: { value: '1', name: 'cativa' },
      });
      // Dejar CUIT vacío (campo aparece al cambiar cativa)
      clickCrearUsuario();

      await waitFor(() => {
        expect(screen.getByText(/cuit es obligatorio/i)).toBeInTheDocument();
      });
    });

    it('contraseñas que no coinciden → debería mostrar error "no coinciden"', async () => {
      render(<NuevoUsuarioPage />);
      completarCamposMinimos();

      fireEvent.change(screen.getByLabelText(/contraseña inicial/i), {
        target: { value: 'abc123', name: 'clave' },
      });
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
        target: { value: 'xyz999', name: 'claveConfirm' },
      });
      clickCrearUsuario();

      await waitFor(() => {
        expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
      });
    });

    it('contraseña que supera 8 caracteres → debería mostrar error "8 caracteres"', async () => {
      render(<NuevoUsuarioPage />);
      completarCamposMinimos();

      const claveQueSuperaElLimite = 'contraseña_muy_larga_123';
      fireEvent.change(screen.getByLabelText(/contraseña inicial/i), {
        target: { value: claveQueSuperaElLimite, name: 'clave' },
      });
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
        target: { value: claveQueSuperaElLimite, name: 'claveConfirm' },
      });
      clickCrearUsuario();

      await waitFor(() => {
        expect(screen.getByText(/8 caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('envío exitoso', () => {
    it('con todos los campos válidos → debería llamar a fetch con los datos correctos', async () => {
      const mockData = { nombre: 'Juan García', codigo: 'CLI001' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<NuevoUsuarioPage />);
      completarCamposMinimos();
      clickCrearUsuario();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(options.body);

      expect(url).toContain('/web-usuarios/');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toContain('Bearer');
      expect(body.nombre).toBe('Juan García');
      expect(body.e_mail).toBe('juan@ejemplo.com');
      expect(body.nrodoc).toBe('30123456');
      expect(body.locali).toBe(8000);
    });

    it('envío exitoso → debería mostrar el mensaje de éxito con el nombre del usuario', async () => {
      const mockData = { nombre: 'Juan García', codigo: 'CLI001' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      render(<NuevoUsuarioPage />);
      completarCamposMinimos();
      clickCrearUsuario();

      await waitFor(() => {
        expect(screen.getByText(/juan garcía/i)).toBeInTheDocument();
        expect(screen.getByText(/creado correctamente/i)).toBeInTheDocument();
      });
    });
  });
});
