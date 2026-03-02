import { ShortCard } from './ShortCard';

interface ShortsGridProps {
  videoOutIds: number[];
}

export function ShortsGrid({ videoOutIds }: ShortsGridProps) {
  if (videoOutIds.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gray-200 p-4">
              <svg
                className="h-8 w-8 text-gray-400"
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
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No hay shorts generados</h3>
          <p className="text-sm text-gray-600">
            Los shorts se están procesando. Esto puede tomar unos minutos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Shorts generados ({videoOutIds.length})
        </h3>
        <p className="text-sm text-gray-600">
          Formato vertical 9:16 optimizado para redes sociales
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videoOutIds.map((id, index) => (
          <ShortCard key={id} videoOutputId={id} index={index} />
        ))}
      </div>
    </div>
  );
}
