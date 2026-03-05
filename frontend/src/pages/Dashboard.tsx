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
import type { InstructionsVideo } from '@/types/video.types';
import { VideoProcessingOptions } from '@/components/features/VideoProcessingOptions';
import { Plus, Video, Clapperboard, Database, X, ChevronLeft, Loader2, Upload } from 'lucide-react';
import { useRefreshUser } from '@/hooks/useRefreshUser';

const DEFAULT_INSTRUCTIONS: InstructionsVideo = {
  withSceneDetector: false,
  isFollowFace: false,
  minSceneDuration: 5,
  maxSceneDuration: 60,
  numberOfSegments: 3,
  vectorTimes: undefined,
};

function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 MB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function JobPoller({
  jobId,
  onFinished,
  onFailed,
}: {
  jobId: number;
  onFinished: (id: number) => void;
  onFailed: (id: number) => void;
}) {
  useJobPolling({
    idJob: jobId,
    enabled: true,
    onFinished: () => onFinished(jobId),
    onFailed: () => onFailed(jobId),
  });
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: videos = [], isLoading } = useVideos();
  const { mutate: uploadVideo, isPending: isUploading } = useUploadVideo();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeJobIds, setActiveJobIds] = useState<number[]>(() => {
    const stored = localStorage.getItem('activeJobIds');
    return stored ? JSON.parse(stored) : [];
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<'file' | 'options'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState<InstructionsVideo>(DEFAULT_INSTRUCTIONS);

  const refreshUser = useRefreshUser();

  const addActiveJob = (id: number) => {
    setActiveJobIds((prev) => {
      const next = [...prev, id];
      localStorage.setItem('activeJobIds', JSON.stringify(next));
      return next;
    });
  };

  const removeActiveJob = (id: number) => {
    setActiveJobIds((prev) => {
      const next = prev.filter((j) => j !== id);
      if (next.length === 0) {
        localStorage.removeItem('activeJobIds');
      } else {
        localStorage.setItem('activeJobIds', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setUploadStep('options');
  };

  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    uploadVideo(
      { file: selectedFile, instructions, onProgress: setUploadProgress },
      {
        onSuccess: (jobState) => {
          addActiveJob(jobState.idJob);
          setShowUploadModal(false);
          setUploadStep('file');
          setSelectedFile(null);
          setInstructions(DEFAULT_INSTRUCTIONS);
          setUploadProgress(0);
        },
      },
    );
  };

  const handleCloseModal = () => {
    if (isUploading) return;
    setShowUploadModal(false);
    setUploadStep('file');
    setSelectedFile(null);
    setInstructions(DEFAULT_INSTRUCTIONS);
  };

  const stats = {
    totalVideos: videos.length,
    totalShorts: videos.reduce((acc, v) => acc + v.videoOutIds.length, 0),
  };

  return (
    <div className="container mx-auto bg-gray-50 px-4 py-8 md:py-14">
      {/* Pollers — uno por job activo */}
      {activeJobIds.map((jobId) => (
        <JobPoller
          key={jobId}
          jobId={jobId}
          onFinished={(id) => {
            removeActiveJob(id);
            queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
            refreshUser();
            toast.success('¡Shorts listos!');
          }}
          onFailed={(id) => {
            removeActiveJob(id);
            toast.error('El procesamiento falló');
          }}
        />
      ))}

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="w-full">
            <h1 className="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              ¡Hola, {user?.name}! 👋
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">Gestiona tus videos y shorts aquí</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="w-full shrink-0 gap-2 sm:w-fit">
            <Plus className="h-5 w-5" />
            <span>Subir video</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 md:text-sm">Videos subidos</p>
              <p className="text-xl font-bold text-gray-900 md:text-2xl">{stats.totalVideos}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <Clapperboard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 md:text-sm">Shorts generados</p>
              <p className="text-xl font-bold text-gray-900 md:text-2xl">{stats.totalShorts}</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 sm:col-span-1 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2 sm:p-3">
              <Database className="h-5 w-5 text-orange-600 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 md:text-sm">Almacenamiento</p>
              <p className="text-xl font-bold text-gray-900 md:text-2xl">
                {formatStorageSize(user?.folderSizeBytes ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {uploadStep === 'options' && (
                  <button
                    onClick={() => setUploadStep('file')}
                    disabled={isUploading}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-sm font-bold text-gray-900 sm:text-lg md:text-xl">
                    {uploadStep === 'file' ? 'Subir video' : 'Opciones de procesamiento'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Paso {uploadStep === 'file' ? '1' : '2'} de 2
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isUploading}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-blue-500" />
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  uploadStep === 'options' ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            </div>

            {uploadStep === 'file' ? (
              <VideoUpload onUpload={handleFileSelected} isUploading={false} uploadProgress={0} />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <Video className="h-5 w-5 shrink-0 text-blue-600" />
                  <span className="min-w-0 truncate text-sm font-medium text-gray-700">
                    {selectedFile?.name}
                  </span>
                </div>

                <VideoProcessingOptions value={instructions} onChange={setInstructions} />

                {isUploading ? (
                  <div className="space-y-2">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      Subiendo... {uploadProgress}%
                    </p>
                  </div>
                ) : (
                  <Button variant="primary" onClick={handleConfirmUpload} className="w-full gap-2">
                    <Upload className="h-5 w-5" />
                    Generar shorts
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banner procesamiento activo */}
      {activeJobIds.length > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">
              {activeJobIds.length === 1
                ? 'Procesando tu video'
                : `Procesando videos (${activeJobIds.length} en cola)`}
            </p>
            <p className="text-sm text-blue-700">
              Esto puede tardar unos minutos. Te avisaremos cuando estén listos.
            </p>
          </div>
        </div>
      )}

      {/* Video List */}
      <VideoList videos={videos} isLoading={isLoading} onUpload={() => setShowUploadModal(true)} />
    </div>
  );
}
