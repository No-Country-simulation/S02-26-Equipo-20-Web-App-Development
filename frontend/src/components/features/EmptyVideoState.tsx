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
              <svg
                className="h-16 w-16 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <div className="absolute -top-2 -right-2 h-4 w-4 animate-bounce rounded-full bg-purple-400" />
              <div className="animation-delay-150 absolute -bottom-1 -left-1 h-3 w-3 animate-bounce rounded-full bg-blue-400" />
            </div>
          </div>
        </div>

        <h3 className="mb-2 text-2xl font-bold text-gray-900">{message}</h3>
        <p className="mb-8 text-gray-600">
          Sube tu primer video horizontal y conviértelo automáticamente en shorts verticales.
        </p>

        {onUpload && (
          <Button variant="primary" onClick={onUpload} className="gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Subir video
          </Button>
        )}
      </div>
    </div>
  );
}
