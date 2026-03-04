import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { videoService } from '@/api/services/video.service';
import { queryKeys } from '@/lib/queryClient';

export function useReprocessVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      videoInputId,
      instructions,
    }: {
      videoInputId: number;
      instructions: Parameters<typeof videoService.reprocessVideo>[1];
    }) => videoService.reprocessVideo(videoInputId, instructions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
      toast.success('Reprocesamiento iniciado');
    },
    onError: () => {
      toast.error('Error al reprocesar el video');
    },
  });
}
