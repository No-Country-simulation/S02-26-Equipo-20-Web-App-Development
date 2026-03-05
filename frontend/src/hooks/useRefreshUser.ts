import { authService } from '@/api/services/auth.service';
import { useAuth } from './useAuth';

export function useRefreshUser() {
  const { updateUser } = useAuth();

  return async () => {
    try {
      const user = await authService.me();
      updateUser(user);
    } catch {
      // Si falla el refresh no es crítico, ignorar silenciosamente
    }
  };
}
