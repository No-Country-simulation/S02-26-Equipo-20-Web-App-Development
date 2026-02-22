import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/api/axios.config';
import { AxiosError } from 'axios';
import type { RegisterRequest } from '@/types/auth.types';

export function useRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/dashboard');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        // Esto debería ser error 409 cuando el email ya esta registrado
        // Corregir una vez que se haya implementado en backend
        if (status === 403 || status === 409 || status === 500) {
          toast.error('Este email ya está registrado');
          return;
        }
      }
      toast.error(getErrorMessage(error));
    },
  });
}
