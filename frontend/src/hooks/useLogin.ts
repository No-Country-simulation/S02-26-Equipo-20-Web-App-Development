import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getErrorMessage } from '@/api/axios.config';
import { authService } from '@/api/services/auth.service';
import type { LoginRequest } from '@/types/auth.types';

/**
 * Hook para login de usuario
 * Ejemplo de uso de TanStack Query v5 con mutations
 */
export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),

    onSuccess: (data) => {
      toast.success(`¡Bienvenido, ${data.user.email}!`);
      navigate('/dashboard');
    },

    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

/**
 * Uso del hook:
 *
 * function LoginForm() {
 *   const { mutate: login, isPending } = useLogin();
 *
 *   const onSubmit = (data: LoginFormData) => {
 *     login(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <Button isLoading={isPending}>Login</Button>
 *     </form>
 *   );
 * }
 */
