import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useVideos } from '@/hooks/useVideos';
import { useUploadVideo } from '@/hooks/useUploadVideo';
import { useJobPolling } from '@/hooks/useJobPolling';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { VideoList } from '@/components/features/VideoList';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { InstructionsVideo } from '@/types/video.types';
import { Plus, Video, Clapperboard, Database } from 'lucide-react';
import { useRefreshUser } from '@/hooks/useRefreshUser';
import { useActiveJobs } from '@/hooks/useActiveJobs';
import { UploadModal } from '@/components/features/UploadModal';
import { ProcessingBanner } from '@/components/ui/ProcessingBanner';

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<'file' | 'options'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState<InstructionsVideo>(DEFAULT_INSTRUCTIONS);

  const { activeJobIds, addJob, removeJob } = useActiveJobs();
  const refreshUser = useRefreshUser();

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
          addJob(jobState.idJob);
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
            removeJob(id);
            queryClient.invalidateQueries({ queryKey: queryKeys.videos.list() });
            refreshUser();
            toast.success('¡Shorts listos!');
          }}
          onFailed={(id) => {
            removeJob(id);
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
              <p className="text-base font-bold text-gray-900 lg:text-2xl">{stats.totalVideos}</p>
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
              <p className="text-base font-bold text-gray-900 lg:text-2xl">{stats.totalShorts}</p>
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
              <p className="text-base font-bold text-gray-900 lg:text-2xl">
                {formatStorageSize(user?.folderSizeBytes ?? 0)} / 5GB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={showUploadModal}
        onClose={handleCloseModal}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        uploadStep={uploadStep}
        selectedFile={selectedFile}
        instructions={instructions}
        onStepBack={() => setUploadStep('file')}
        onFileSelected={handleFileSelected}
        onInstructionsChange={setInstructions}
        onConfirm={handleConfirmUpload}
      />

      {/* Banner procesamiento activo */}
      {activeJobIds.length > 0 && <ProcessingBanner count={activeJobIds.length} />}

      {/* Video List */}
      <VideoList videos={videos} isLoading={isLoading} onUpload={() => setShowUploadModal(true)} />
    </div>
  );
}
