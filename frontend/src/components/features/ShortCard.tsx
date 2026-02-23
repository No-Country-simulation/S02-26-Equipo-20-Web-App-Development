import type { Short } from '@/types/video.types';
import { Button } from '@/components/ui/Button';

interface ShortCardProps {
  short: Short;
  onDownload?: (shortId: string) => void;
  onPreview?: (shortId: string) => void;
}

export function ShortCard({ short, onDownload, onPreview }: ShortCardProps) {
  const formatDuration = (seconds: number): string => {
    return `${seconds}s`;
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">
      {/* Thumbnail - Aspect Ratio 9:16 (vertical) */}
      <div className="relative aspect-9/16 overflow-hidden bg-gray-900">
        <img
          src={short.thumbnailUrl}
          alt={short.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40">
          <div className="flex h-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPreview?.(short.id)}
              className="gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Vista previa
            </Button>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute right-2 bottom-2 rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {formatDuration(short.duration)}
        </div>

        {/* Format Badge */}
        <div className="absolute top-2 left-2 rounded-md bg-purple-500 px-2 py-1 text-xs font-bold text-white">
          9:16
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h4 className="mb-2 line-clamp-1 text-sm font-semibold text-gray-900">{short.title}</h4>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload?.(short.id)}
            className="flex-1 gap-1.5">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Descargar
          </Button>

          <Button variant="ghost" size="sm" className="shrink-0">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
