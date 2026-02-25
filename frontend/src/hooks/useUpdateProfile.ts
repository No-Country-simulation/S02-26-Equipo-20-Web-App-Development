import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { userService, type UpdateProfileRequest } from '@/api/services/user.service';

export function useUpdateProfile() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast.success('Perfil actualizado correctamente');
    },
    onError: () => {
      toast.error('No se pudo actualizar el perfil');
    },
  });
}
