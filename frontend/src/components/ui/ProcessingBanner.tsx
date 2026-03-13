import { Loader2 } from 'lucide-react';

interface ProcessingBannerProps {
  count?: number;
  message?: string;
}

export function ProcessingBanner({ count = 1, message }: ProcessingBannerProps) {
  const title =
    message ?? (count === 1 ? 'Procesando tu video' : `Procesando videos (${count} en cola)`);

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
      <div>
        <p className="font-medium text-blue-900">{title}</p>
        <p className="text-sm text-blue-700">
          Esto puede tardar unos minutos. Te avisaremos cuando estén listos.
        </p>
      </div>
    </div>
  );
}
