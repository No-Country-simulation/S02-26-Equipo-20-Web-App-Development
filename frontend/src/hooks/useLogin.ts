import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios.config';
import type { LoginRequest } from '@/types/auth.types';
import { useAuth } from './useAuth';

/**
 * Hook para login de usuario
 * Ejemplo de uso de TanStack Query v5 con mutations
 */
export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: () => {
      toast.success('¡Bienvenido de vuelta!');
      navigate('/dashboard');
    },
    onError: (error) => {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) {
        toast.error('Email o contraseña incorrectos');
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}
