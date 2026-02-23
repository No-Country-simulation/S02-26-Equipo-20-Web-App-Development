import type { Video } from '@/types/video.types';
import { VideoCard } from './VideoCard';
import { EmptyVideoState } from './EmptyVideoState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface VideoListProps {
  videos: Video[];
  isLoading?: boolean;
  onDelete?: (videoId: string) => void;
  emptyMessage?: string;
}

export function VideoList({
  videos,
  isLoading = false,
  onDelete,
  emptyMessage = 'Aún no has subido ningún video',
}: VideoListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (videos.length === 0) {
    return <EmptyVideoState message={emptyMessage} />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onDelete={onDelete} />
      ))}
    </div>
  );
}
