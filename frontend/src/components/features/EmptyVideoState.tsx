import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';

interface EmptyVideoStateProps {
  message?: string;
  showUploadButton?: boolean;
}

export function EmptyVideoState({
  message = 'Aún no has subido ningún video',
  showUploadButton = true,
}: EmptyVideoStateProps) {
  return (
    <div className="flex min-h-125 items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Outer Circle - Pulse Animation */}
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />

            {/* Middle Circle */}
            <div className="relative rounded-full bg-linear-to-br from-blue-100 to-purple-100 p-8">
              {/* Icon */}
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

              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 h-4 w-4 animate-bounce rounded-full bg-purple-400" />
              <div className="animation-delay-150 absolute -bottom-1 -left-1 h-3 w-3 animate-bounce rounded-full bg-blue-400" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h3 className="mb-2 text-2xl font-bold text-gray-900">{message}</h3>
        <p className="mb-8 text-gray-600">
          Sube tu primer video horizontal y convierte automáticamente en shorts verticales para
          redes sociales.
        </p>

        {/* CTA */}
        {showUploadButton && (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/dashboard?upload=true">
              <Button variant="primary" className="gap-2">
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
            </Link>
            <Button variant="outline" className="gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ver tutorial
            </Button>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid gap-4 text-left">
          {[
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              ),
              title: 'Procesamiento rápido',
              desc: 'Tu video estará listo en menos de 2 minutos',
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
              title: 'Formato perfecto',
              desc: 'Optimizado para TikTok, Reels e YouTube Shorts',
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ),
              title: '100% automático',
              desc: 'Sin edición manual ni configuración complicada',
            },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="shrink-0 rounded-lg bg-blue-50 p-2">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
