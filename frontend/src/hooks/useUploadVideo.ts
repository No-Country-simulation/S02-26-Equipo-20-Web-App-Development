import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { videoService } from '@/api/services/video.service';
import { queryKeys } from '@/lib/queryClient';
import type { InstructionsVideo } from '@/types/video.types';

interface UploadVideoParams {
  file: File;
  instructions: InstructionsVideo;
  onProgress?: (progress: number) => void;
}

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, instructions, onProgress }: UploadVideoParams) =>
      videoService.uploadVideo(file, instructions, onProgress),
    onSuccess: () => {
      // Invalidar la lista para que se recargue cuando el job termine
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
      toast.success('Video subido. Procesando...');
    },
    onError: () => {
      toast.error('Error al subir el video');
    },
  });
}
