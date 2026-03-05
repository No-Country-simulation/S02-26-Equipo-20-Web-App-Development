import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, AlertCircle, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function VideoUpload({
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  maxSizeMB = 500,
  acceptedFormats = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
}: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!acceptedFormats.includes(file.type)) {
      setError(
        `Formato no soportado. Solo se aceptan: ${acceptedFormats.map((f) => f.split('/')[1].toUpperCase()).join(', ')}`,
      );
      return false;
    }
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) onUpload(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFile(files[0]);
  };

  const handleClick = () => fileInputRef.current?.click();

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? handleClick : undefined}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'scale-[1.02] border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative px-6 py-10 sm:px-12 sm:py-12">
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div
                className={`rounded-full p-4 transition-all duration-300 ${isDragging ? 'scale-110 bg-blue-100' : 'bg-gray-200'}`}>
                <Upload
                  className={`h-8 w-8 transition-colors md:h-8 md:w-8 ${isDragging ? 'text-blue-600' : 'text-gray-600'}`}
                />
              </div>
            </div>
            {isUploading ? (
              <div className="space-y-4">
                <p className="text-lg font-semibold text-gray-900">Subiendo video...</p>
                {/* Progress Bar */}
                <div className="mx-auto w-full max-w-xs">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra tu video aquí'}
                </p>
                <p className="text-sm text-gray-600">
                  o{' '}
                  <span className="font-medium text-blue-600 hover:text-blue-700">
                    selecciona un archivo
                  </span>
                </p>
              </div>
            )}
            {!isUploading && (
              <div className="mt-6 space-y-1 text-xs text-gray-500">
                <p>Formatos: MP4, WebM, MOV, AVI</p>
                <p>Tamaño máximo: {maxSizeMB}MB</p>
              </div>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />
      </div>
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al subir archivo</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      {!isUploading && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={handleClick} className="gap-2">
            <FolderOpen className="h-5 w-5" />
            Seleccionar archivo
          </Button>
        </div>
      )}
    </div>
  );
}
