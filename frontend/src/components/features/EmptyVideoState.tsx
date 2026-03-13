import { Video, Upload } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyVideoStateProps {
  message?: string;
  onUpload?: () => void;
}

export function EmptyVideoState({
  message = 'Aún no has subido ningún video',
  onUpload,
}: EmptyVideoStateProps) {
  return (
    <div className="flex min-h-125 items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
            <div className="relative rounded-full bg-linear-to-br from-blue-100 to-purple-100 p-8">
              <Video className="h-16 w-16 text-blue-600" strokeWidth={1.5} />
              <div className="absolute -top-2 -right-2 h-4 w-4 animate-bounce rounded-full bg-purple-400" />
              <div className="absolute -bottom-1 -left-1 h-3 w-3 animate-bounce rounded-full bg-blue-400" />
            </div>
          </div>
        </div>
        <h3 className="mb-2 text-xl font-bold text-pretty text-gray-900 md:text-2xl">{message}</h3>
        <p className="mb-8 text-pretty text-gray-600">
          Sube tu primer video horizontal y conviértelo automáticamente en shorts verticales.
        </p>
        {onUpload && (
          <Button variant="primary" onClick={onUpload} className="gap-2">
            <Upload className="h-5 w-5" />
            Subir video
          </Button>
        )}
      </div>
    </div>
  );
}
