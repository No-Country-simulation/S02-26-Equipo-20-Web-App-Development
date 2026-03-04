import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { videoService } from '@/api/services/video.service';
import { queryKeys } from '@/lib/queryClient';
import { useRefreshUser } from './useRefreshUser';

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  const refreshUser = useRefreshUser();

  return useMutation({
    mutationFn: (videoInputId: number) => videoService.deleteVideoIn(videoInputId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
      await refreshUser();
      toast.success('Video eliminado');
    },
    onError: () => {
      toast.error('No se puede eliminar un video en procesamiento');
    },
  });
}
