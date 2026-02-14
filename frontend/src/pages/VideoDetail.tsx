/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { ShortsGrid } from '@/components/features/ShortsGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fetchMockVideo } from '@/mocks/videos.mock';
import type { Video } from '@/types/video.types';
import { toast } from 'sonner';

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVideo(id);
    }
  }, [id]);

  const loadVideo = async (videoId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchMockVideo(videoId);
      setVideo(data);
    } catch {
      toast.error('Error al cargar video');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadShort = (_shortId: string) => {
    toast.success('Descargando short...');
    // Aquí iría la lógica real de descarga
  };

  const handlePreviewShort = (_shortId: string) => {
    toast.info('Reproduciendo short');
    // Aquí iría la lógica de preview/modal
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Video no encontrado</h2>
          <p className="mb-6 text-gray-600">El video que buscas no existe</p>
          <Link to="/dashboard">
            <Button variant="primary">Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver al Dashboard
        </Link>

        {/* Video Info Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Video Preview */}
            <div className="relative aspect-video overflow-hidden bg-gray-900">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0" />
              <div className="absolute right-4 bottom-4 left-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-black/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {formatDuration(video.duration)}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium backdrop-blur-sm ${
                      video.status === 'completed'
                        ? 'bg-green-500/90 text-white'
                        : video.status === 'processing'
                          ? 'bg-blue-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                    }`}>
                    {video.status === 'completed'
                      ? 'Completado'
                      : video.status === 'processing'
                        ? 'Procesando'
                        : 'Error'}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Details */}
            <div className="p-6">
              <h1 className="mb-4 text-2xl font-bold text-gray-900">{video.title}</h1>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Subido el {formatDate(video.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Duración: {formatDuration(video.duration)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                  <span>
                    {video.shorts.length}{' '}
                    {video.shorts.length === 1 ? 'short generado' : 'shorts generados'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Descargar original
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Shorts Grid */}
        <ShortsGrid
          shorts={video.shorts}
          onDownload={handleDownloadShort}
          onPreview={handlePreviewShort}
        />
      </div>
    </div>
  );
}
