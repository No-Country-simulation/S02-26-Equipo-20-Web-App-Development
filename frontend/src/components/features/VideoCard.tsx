import { Link } from 'react-router';
import type { Video } from '@/types/video.types';
import { Button } from '@/components/ui/Button';

interface VideoCardProps {
  video: Video;
  onDelete?: (videoId: string) => void;
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusConfig = (status: Video['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completado',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'processing':
        return {
          label: 'Procesando',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ),
        };
      case 'failed':
        return {
          label: 'Error',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      default:
        return {
          label: 'Subiendo',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: null,
        };
    }
  };

  const statusConfig = getStatusConfig(video.status);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">
      {/* Thumbnail */}
      <Link to={`/videos/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-gray-900">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0" />

          {/* Duration Badge */}
          <div className="absolute right-2 bottom-2 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {formatDuration(video.duration)}
          </div>

          {/* Processing Progress */}
          {video.status === 'processing' && video.processingProgress !== undefined && (
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-black/50">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${video.processingProgress}%` }}
              />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Status Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Title */}
        <Link to={`/videos/${video.id}`}>
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 transition-colors hover:text-blue-600">
            {video.title}
          </h3>
        </Link>

        {/* Metadata */}
        <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(video.createdAt)}
          </span>

          {video.status === 'completed' && video.shorts.length > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {video.shorts.length} {video.shorts.length === 1 ? 'short' : 'shorts'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {video.status === 'completed' && (
            <Link to={`/videos/${video.id}`} className="flex-1">
              <Button variant="primary" size="sm" className="w-full gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Ver shorts
              </Button>
            </Link>
          )}

          {video.status === 'processing' && (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              Procesando...
            </Button>
          )}

          {video.status === 'failed' && (
            <Button variant="outline" size="sm" className="flex-1">
              Reintentar
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(video.id)}
              className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
