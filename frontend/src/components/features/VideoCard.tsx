import { Link } from 'react-router';
import type { VideoInWithVideoOutIds } from '@/types/video.types';
import { Button } from '@/components/ui/Button';
import { Eye, Video, Scissors, ScanSearch, Clock } from 'lucide-react';

interface VideoCardProps {
  video: VideoInWithVideoOutIds;
}

function StrategyBadge({ strategy }: { strategy: string }) {
  const s = strategy.toLowerCase();

  if (s.startsWith('scenedetector')) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200">
        <ScanSearch className="h-3 w-3" />
        Escenas
      </span>
    );
  }
  if (s.startsWith('choosetimes')) {
    const hasJoin = s.includes('join');
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
        <Clock className="h-3 w-3" />
        {hasJoin ? 'Tiempos (fusionado)' : 'Tiempos'}
      </span>
    );
  }
  const match = strategy.match(/\d+/);
  const count = match ? match[0] : '?';
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
      <Scissors className="h-3 w-3" />
      {count} segmentos
    </span>
  );
}

export function VideoCard({ video }: VideoCardProps) {
  const { videoInId, videoOutIds, strategy } = video;
  const isCompleted = videoOutIds.length > 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-sm sm:px-5 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-10 sm:w-10">
          <Video className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">Video #{videoInId}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <StrategyBadge strategy={strategy} />
            <span className="text-sm text-gray-500">
              {isCompleted
                ? `· ${videoOutIds.length} ${videoOutIds.length === 1 ? 'short' : 'shorts'}`
                : '· Procesando...'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isCompleted && (
          <Link to={`/videos/${videoInId}`}>
            <Button variant="primary" size="sm" className="gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Ver shorts</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
