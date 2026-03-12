import { Video, ChevronLeft, Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { VideoUpload } from '@/components/features/VideoUpload';
import { VideoProcessingOptions } from '@/components/features/VideoProcessingOptions';
import { Button } from '@/components/ui/Button';
import type { InstructionsVideo } from '@/types/video.types';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadStep: 'file' | 'options';
  selectedFile: File | null;
  instructions: InstructionsVideo;
  onStepBack: () => void;
  onFileSelected: (file: File) => void;
  onInstructionsChange: (instructions: InstructionsVideo) => void;
  onConfirm: () => void;
}

export function UploadModal({
  open,
  onClose,
  isUploading,
  uploadProgress,
  uploadStep,
  selectedFile,
  instructions,
  onStepBack,
  onFileSelected,
  onInstructionsChange,
  onConfirm,
}: UploadModalProps) {
  return (
    <Modal open={open} onClose={onClose} disabled={isUploading} title="" subtitle="">
      {/* Header con pasos — sobreescribe el title del Modal con layout propio */}
      <div className="-mt-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {uploadStep === 'options' && (
            <button
              onClick={onStepBack}
              disabled={isUploading}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h2 className="text-sm font-bold text-gray-900 sm:text-lg md:text-xl">
              {uploadStep === 'file' ? 'Subir video' : 'Opciones de procesamiento'}
            </h2>
            <p className="text-sm text-gray-500">Paso {uploadStep === 'file' ? '1' : '2'} de 2</p>
          </div>
        </div>
      </div>

      {/* Barra de progreso de pasos */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-blue-500" />
        <div
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            uploadStep === 'options' ? 'bg-blue-500' : 'bg-gray-200'
          }`}
        />
      </div>

      {uploadStep === 'file' ? (
        <VideoUpload onUpload={onFileSelected} isUploading={false} uploadProgress={0} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <Video className="h-5 w-5 shrink-0 text-blue-600" />
            <span className="min-w-0 truncate text-sm font-medium text-gray-700">
              {selectedFile?.name}
            </span>
          </div>

          <VideoProcessingOptions value={instructions} onChange={onInstructionsChange} />

          {isUploading ? (
            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600">Subiendo... {uploadProgress}%</p>
            </div>
          ) : (
            <Button variant="primary" onClick={onConfirm} className="w-full gap-2">
              <Upload className="h-5 w-5" />
              Generar shorts
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
