import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { videoService } from '@/api/services/video.service';
import api from '@/api/axios.config';
import { toast } from 'sonner';

interface ShortCardProps {
  videoOutputId: number;
  index: number;
}

export function ShortCard({ videoOutputId, index }: ShortCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(streamUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `short-${videoOutputId}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar el short');
    } finally {
      setIsDownloading(false);
    }
  };

  const streamUrl = videoService.getStreamUrl(videoOutputId);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">
      {/* Video - Aspect Ratio 9:16 */}
      <div className="relative aspect-9/16 overflow-hidden bg-gray-900">
        <video
          ref={videoRef}
          src={streamUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play/Pause Overlay */}
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30"
          onClick={togglePlay}>
          <div
            className={`transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            {isPlaying ? (
              <svg
                className="h-12 w-12 text-white drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-12 w-12 text-white drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="mb-2 text-sm font-semibold text-gray-900">Short #{index + 1}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 gap-1.5">
            {isDownloading ? 'Descargando...' : 'Descargar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
