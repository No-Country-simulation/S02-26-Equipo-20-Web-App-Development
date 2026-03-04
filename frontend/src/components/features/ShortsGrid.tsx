import { Video } from 'lucide-react';
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
              <Video className="h-8 w-8 text-gray-400" />
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
