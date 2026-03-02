import { useState } from 'react';
import { Link } from 'react-router';
import type { VideoInWithVideoOutIds } from '@/types/video.types';
import { Button } from '@/components/ui/Button';
import { useDeleteVideo } from '@/hooks/useDeleteVideo';

interface VideoCardProps {
  video: VideoInWithVideoOutIds;
}

export function VideoCard({ video }: VideoCardProps) {
  const { videoInId, videoOutIds } = video;
  const isCompleted = videoOutIds.length > 0;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: deleteVideo, isPending: isDeleting } = useDeleteVideo();

  const handleDelete = () => {
    deleteVideo(videoInId, {
      onSuccess: () => setConfirmDelete(false),
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-sm sm:px-5 sm:py-4">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 sm:h-10 sm:w-10">
          <svg
            className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
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

      {/* Right */}
      <div className="flex shrink-0 items-center gap-2">
        {confirmDelete ? (
          <>
            <span className="hidden text-sm text-gray-600 sm:inline">¿Eliminar?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}>
              No
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5 border-red-200 bg-red-50 text-red-700 hover:bg-red-100">
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </>
        ) : (
          <>
            {isCompleted && (
              <span className="hidden items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 sm:inline-flex">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Completado
              </span>
            )}
            {isCompleted ? (
              <Link to={`/videos/${videoInId}`}>
                <Button variant="primary" size="sm" className="gap-1.5">
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
                  <span className="hidden sm:inline">Ver shorts</span>
                </Button>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Procesando
              </span>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Eliminar video">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
