import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import api from '@/api/axios.config';
import { videoService } from '@/api/services/video.service';
import { toast } from 'sonner';

interface ShortCardProps {
  videoOutputId: number;
  index: number;
}

export function ShortCard({ videoOutputId, index }: ShortCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const streamUrl = videoService.getStreamUrl(videoOutputId);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(streamUrl, {
        responseType: 'blob',
        headers: { Range: 'bytes=0-' },
      });
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

  return (
    <>
      {/* Card */}
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg">
        <div
          className="relative aspect-9/16 cursor-pointer overflow-hidden bg-gray-900"
          onClick={() => setShowModal(true)}>
          <video
            src={streamUrl}
            className="h-full w-full object-cover"
            preload="metadata"
            playsInline
          />
          {/* Play overlay siempre visible */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
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
          </div>
        </div>

        <div className="p-3">
          <p className="mb-2 text-sm font-semibold text-gray-900">Short #{index + 1}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full gap-1.5">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {isDownloading ? 'Descargando...' : 'Descargar'}
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowModal(false)}>
            <div
              className="relative flex h-full max-h-[80dvh] w-full max-w-sm flex-col"
              onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Video */}
              <video
                src={streamUrl}
                className="h-full w-full rounded-xl object-contain"
                controls
                autoPlay
                playsInline
                onClick={(e) => e.stopPropagation()}
              />

              {/* Footer del modal */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white">Short #{index + 1}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="gap-1.5 border-white/30 text-white hover:bg-white/10">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {isDownloading ? 'Descargando...' : 'Descargar'}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
