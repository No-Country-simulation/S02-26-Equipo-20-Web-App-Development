/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVideos } from '@/hooks/useVideos';
import { useUploadVideo } from '@/hooks/useUploadVideo';
import { useJobPolling } from '@/hooks/useJobPolling';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { VideoUpload } from '@/components/features/VideoUpload';
import { VideoList } from '@/components/features/VideoList';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { InstructionsVideo, JobState } from '@/types/video.types';

// Instrucciones por defecto para el MVP
const DEFAULT_INSTRUCTIONS: InstructionsVideo = {
  withSceneDetector: false,
  isFollowFace: false,
  minSceneDuration: 5,
  maxSceneDuration: 60,
  numberOfSegments: 3,
  vectorTimes: undefined,
};

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: videos = [], isLoading } = useVideos();
  const { mutate: uploadVideo, isPending: isUploading } = useUploadVideo();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  // Polling del job activo
  useJobPolling({
    idJob: activeJobId,
    enabled: activeJobId !== null,
    onFinished: (_state: JobState) => {
      setActiveJobId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
      toast.success('¡Shorts listos!');
    },
    onFailed: (_state: JobState) => {
      setActiveJobId(null);
      toast.error('El procesamiento falló');
    },
  });

  const handleUpload = (file: File) => {
    uploadVideo(
      {
        file,
        instructions: DEFAULT_INSTRUCTIONS,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: (jobState) => {
          setActiveJobId(jobState.idJob);
          setShowUploadModal(false);
          setUploadProgress(0);
        },
      },
    );
  };

  // Stats
  const stats = {
    totalVideos: videos.length,
    totalShorts: videos.reduce((acc, v) => acc + v.videoOutIds.length, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div className="w-full">
              <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                ¡Hola, {user?.name}! 👋
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">
                Gestiona tus videos y shorts aquí
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowUploadModal(true)}
              disabled={isUploading}
              className="w-full shrink-0 gap-2 sm:w-fit">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Subir video</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              <div>
                <p className="text-sm font-medium text-gray-600">Videos subidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVideos}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-100 p-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Shorts generados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShorts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Subir video</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <VideoUpload
                onUpload={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </div>
          </div>
        )}

        {/* Banner procesamiento activo */}
        {activeJobId !== null && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <svg
              className="h-5 w-5 shrink-0 animate-spin text-blue-600"
              fill="none"
              viewBox="0 0 24 24">
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
            <div>
              <p className="font-medium text-blue-900">Procesando tu video</p>
              <p className="text-sm text-blue-700">
                Esto puede tardar unos minutos. Te avisaremos cuando esté listo.
              </p>
            </div>
          </div>
        )}

        {/* Video List */}
        <VideoList
          videos={videos}
          isLoading={isLoading}
          onUpload={() => setShowUploadModal(true)}
        />
      </div>
    </div>
  );
}
