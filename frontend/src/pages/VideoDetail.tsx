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
import { useDeleteVideo } from '@/hooks/useDeleteVideo';
import { ChevronLeft, RotateCcw, Trash2, X, Loader2 } from 'lucide-react';
import { storage } from '@/lib/storage';

const DEFAULT_INSTRUCTIONS: InstructionsVideo = {
  withSceneDetector: false,
  chooseTimes: false,
  joinTimes: false,
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
  const [activeJobId, setActiveJobId] = useState<number | null>(() =>
    storage.getReprocessJob(id ?? ''),
  );
  const [videoDeleted, setVideoDeleted] = useState(false);
  const [confirmDeleteVideo, setConfirmDeleteVideo] = useState(false);
  const { mutate: deleteVideo, isPending: isDeletingVideo } = useDeleteVideo();

  const { mutate: reprocess, isPending: isReprocessing } = useReprocessVideo();

  const video = videos.find((v) => v.videoInId === Number(id));

  const setActiveJob = (jobId: number | null) => {
    setActiveJobId(jobId);
    if (jobId === null) {
      storage.clearReprocessJob(id ?? '');
    } else {
      storage.setReprocessJob(id ?? '', jobId);
    }
  };

  useJobPolling({
    idJob: activeJobId,
    enabled: activeJobId !== null,
    onFinished: (_state: JobState) => {
      setActiveJob(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
      toast.success('¡Shorts listos!');
    },
    onFailed: (_state: JobState) => {
      setActiveJob(null);
      toast.error('El reprocesamiento falló');
    },
  });

  const handleConfirmReprocess = () => {
    if (!video) return;
    reprocess(
      { videoInputId: video.videoInId, instructions },
      {
        onSuccess: (jobState) => {
          setActiveJob(jobState.idJob);
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

  const handleDeleteVideo = () => {
    deleteVideo(video.videoInId, {
      onSuccess: () => {
        setVideoDeleted(true);
        setConfirmDeleteVideo(false);
      },
    });
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-14">
        {/* Back */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="h-5 w-5" />
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
              {videoDeleted ? (
                <div className="flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-400">Video eliminado</p>
                </div>
              ) : (
                <video
                  key={video.videoInId}
                  src={videoService.getStreamInputUrl(video.videoInId)}
                  className="w-full rounded-xl bg-gray-900"
                  controls
                  playsInline
                  preload="metadata"
                />
              )}
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReprocessModal(true)}
                  disabled={activeJobId !== null || videoDeleted}
                  className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reprocesar
                </Button>
                {!videoDeleted ? (
                  confirmDeleteVideo ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmDeleteVideo(false)}
                        disabled={isDeletingVideo}>
                        No
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={handleDeleteVideo}
                        disabled={isDeletingVideo}>
                        {isDeletingVideo ? 'Eliminando...' : 'Sí, eliminar'}
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteVideo(true)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Eliminar video original">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                    Video eliminado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Banner procesamiento activo */}
        {activeJobId !== null && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
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
            <div className="max-h-[90dvh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <VideoProcessingOptions value={instructions} onChange={setInstructions} />

                <Button
                  variant="primary"
                  onClick={handleConfirmReprocess}
                  disabled={isReprocessing}
                  className="w-full gap-2">
                  <RotateCcw className="h-5 w-5" />
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
