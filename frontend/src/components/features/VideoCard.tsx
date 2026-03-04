import { Link } from 'react-router';
import type { VideoInWithVideoOutIds } from '@/types/video.types';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Eye, Loader2, Video } from 'lucide-react';

interface VideoCardProps {
  video: VideoInWithVideoOutIds;
}

export function VideoCard({ video }: VideoCardProps) {
  const { videoInId, videoOutIds } = video;
  const isCompleted = videoOutIds.length > 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-sm sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-10 sm:w-10">
          <Video className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">Video #{videoInId}</p>
          <p className="truncate text-sm text-gray-500">
            {isCompleted
              ? `${videoOutIds.length} ${videoOutIds.length === 1 ? 'short' : 'shorts'}`
              : 'Procesando...'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isCompleted ? (
          <>
            <span className="hidden items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 sm:inline-flex">
              <CheckCircle className="h-3.5 w-3.5" />
              Completado
            </span>
            <Link to={`/videos/${videoInId}`}>
              <Button variant="primary" size="sm" className="gap-1.5">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Ver shorts</span>
              </Button>
            </Link>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Procesando
          </span>
        )}
      </div>
    </div>
  );
}
