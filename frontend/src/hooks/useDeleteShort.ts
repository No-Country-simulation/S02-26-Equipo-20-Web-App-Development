import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { videoService } from '@/api/services/video.service';
import { queryKeys } from '@/lib/queryClient';
import { useRefreshUser } from './useRefreshUser';

export function useDeleteShort() {
  const queryClient = useQueryClient();
  const refreshUser = useRefreshUser();

  return useMutation({
    mutationFn: (videoOutputId: number) => videoService.deleteVideoOut(videoOutputId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
      await refreshUser();
      toast.success('Short eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el short');
    },
  });
}
