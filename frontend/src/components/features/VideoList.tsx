import type { VideoInWithVideoOutIds } from '@/types/video.types';
import { VideoCard } from './VideoCard';
import { EmptyVideoState } from './EmptyVideoState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface VideoListProps {
  videos: VideoInWithVideoOutIds[];
  isLoading?: boolean;
  emptyMessage?: string;
  onUpload?: () => void;
}

export function VideoList({ videos, isLoading = false, emptyMessage, onUpload }: VideoListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (videos.length === 0) {
    return <EmptyVideoState message={emptyMessage} onUpload={onUpload} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((video) => (
        <VideoCard key={video.videoInId} video={video} />
      ))}
    </div>
  );
}
