import { useCallback } from 'react';
import { authService } from '@/api/services/auth.service';
import { useAuth } from './useAuth';

export function useRefreshUser() {
  const { updateUser } = useAuth();

  return useCallback(async () => {
    try {
      const user = await authService.me();
      updateUser(user);
    } catch {
      // Si falla el refresh no es crítico, ignorar silenciosamente
    }
  }, [updateUser]);
}
