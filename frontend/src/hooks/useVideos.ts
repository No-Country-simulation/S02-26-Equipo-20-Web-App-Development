import { useQuery } from '@tanstack/react-query';
import { videoService } from '@/api/services/video.service';
import { queryKeys } from '@/lib/queryClient';

export function useVideos() {
  return useQuery({
    queryKey: queryKeys.videos.list(),
    queryFn: () => videoService.getAllVideos(),
  });
}
