import { useParams, Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { ShortsGrid } from '@/components/features/ShortsGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useVideos } from '@/hooks/useVideos';

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: videos = [], isLoading } = useVideos();

  const video = videos.find((v) => v.videoInId === Number(id));

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
          <p className="mb-6 text-gray-600">El video que buscas no existe o fue eliminado</p>
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
        {/* Back */}
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

        {/* Info */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Video #{video.videoInId}</h1>
          <p className="text-sm text-gray-600">
            {video.videoOutIds.length}{' '}
            {video.videoOutIds.length === 1 ? 'short generado' : 'shorts generados'}
          </p>
        </div>

        {/* Shorts */}
        <ShortsGrid videoOutIds={video.videoOutIds} />
      </div>
    </div>
  );
}
