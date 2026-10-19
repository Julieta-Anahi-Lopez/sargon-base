import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado básico', () => {
    it('debería renderizar el children correctamente', () => {
      render(<Button>Guardar</Button>);
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    });
  });

  describe('variantes', () => {
    it('variant primary: debería tener la clase bg-brand', () => {
      render(<Button variant="primary">Primario</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-brand');
    });

    it('variant secondary: debería tener la clase bg-brand-light', () => {
      render(<Button variant="secondary">Secundario</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-brand-light');
    });
  });

  describe('estado loading', () => {
    it('debería mostrar el spinner cuando loading=true', () => {
      render(<Button loading>Guardando</Button>);
      // El spinner es un span con la clase animate-spin
      const spinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('debería estar deshabilitado cuando loading=true', () => {
      render(<Button loading>Guardando</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('debería seguir mostrando el children junto al spinner', () => {
      render(<Button loading>Guardando</Button>);
      // El children no se oculta, solo se agrega el spinner antes
      expect(screen.getByRole('button')).toHaveTextContent('Guardando');
    });
  });

  describe('estado disabled', () => {
    it('debería estar deshabilitado cuando disabled=true', () => {
      render(<Button disabled>Enviar</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('fullWidth', () => {
    it('debería tener la clase w-full cuando fullWidth=true', () => {
      render(<Button fullWidth>Ancho completo</Button>);
      expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('no debería tener la clase w-full cuando fullWidth no está definido', () => {
      render(<Button>Normal</Button>);
      expect(screen.getByRole('button')).not.toHaveClass('w-full');
    });
  });

  describe('interacciones', () => {
    it('debería llamar a onClick al hacer click', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickeame</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('no debería llamar a onClick cuando está disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>No clickeable</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('no debería llamar a onClick cuando está loading', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} loading>Cargando</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
