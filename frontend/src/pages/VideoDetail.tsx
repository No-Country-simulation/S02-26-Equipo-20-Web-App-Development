/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Button } from '@/components/ui/Button';
import { ShortsGrid } from '@/components/features/ShortsGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { VideoProcessingOptions } from '@/components/features/VideoProcessingOptions';
import { useVideos } from '@/hooks/useVideos';
import { useReprocessVideo } from '@/hooks/useReprocessVideo';
import { useJobPolling } from '@/hooks/useJobPolling';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { InstructionsVideo, JobState } from '@/types/video.types';
import { videoService } from '@/api/services/video.service';

const DEFAULT_INSTRUCTIONS: InstructionsVideo = {
  withSceneDetector: false,
  isFollowFace: false,
  minSceneDuration: 5,
  maxSceneDuration: 60,
  numberOfSegments: 3,
  vectorTimes: undefined,
};

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: videos = [], isLoading } = useVideos();

  const [showReprocessModal, setShowReprocessModal] = useState(false);
  const [instructions, setInstructions] = useState<InstructionsVideo>(DEFAULT_INSTRUCTIONS);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  const { mutate: reprocess, isPending: isReprocessing } = useReprocessVideo();

  const video = videos.find((v) => v.videoInId === Number(id));

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
      toast.error('El reprocesamiento falló');
    },
  });

  const handleConfirmReprocess = () => {
    if (!video) return;
    reprocess(
      { videoInputId: video.videoInId, instructions },
      {
        onSuccess: (jobState) => {
          setActiveJobId(jobState.idJob);
          setShowReprocessModal(false);
          setInstructions(DEFAULT_INSTRUCTIONS);
        },
      },
    );
  };

  const handleCloseModal = () => {
    if (isReprocessing) return;
    setShowReprocessModal(false);
    setInstructions(DEFAULT_INSTRUCTIONS);
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Video original */}
            <div className="w-full shrink-0 lg:w-72">
              <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                Video original
              </p>
              <video
                src={videoService.getStreamInputUrl(video.videoInId)}
                className="w-full rounded-xl bg-gray-900"
                controls
                playsInline
                preload="metadata"
              />
            </div>

            {/* Metadata + acciones */}
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-900">Video #{video.videoInId}</h1>
                <p className="text-sm text-gray-600">
                  {video.videoOutIds.length}{' '}
                  {video.videoOutIds.length === 1 ? 'short generado' : 'shorts generados'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowReprocessModal(true)}
                disabled={activeJobId !== null}
                className="gap-2 self-start">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reprocesar
              </Button>
            </div>
          </div>
        </div>

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
              <p className="font-medium text-blue-900">Reprocesando video</p>
              <p className="text-sm text-blue-700">
                Esto puede tardar unos minutos. Te avisaremos cuando esté listo.
              </p>
            </div>
          </div>
        )}

        {/* Shorts */}
        <ShortsGrid videoOutIds={video.videoOutIds} />

        {/* Modal reprocess */}
        {showReprocessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90dvh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reprocesar video</h2>
                  <p className="text-sm text-gray-500">
                    Se generarán nuevos shorts con estas opciones
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  disabled={isReprocessing}
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

              <div className="space-y-6">
                <VideoProcessingOptions value={instructions} onChange={setInstructions} />

                <Button
                  variant="primary"
                  onClick={handleConfirmReprocess}
                  disabled={isReprocessing}
                  className="w-full gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isReprocessing ? 'Iniciando...' : 'Generar nuevos shorts'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
