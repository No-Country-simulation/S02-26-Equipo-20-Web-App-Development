import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">¡Hola, {user?.name}! 👋</h1>
            <p className="text-gray-600">Bienvenido a tu panel de control de VideoShorts</p>
          </div>

          {/* Placeholder Content */}
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-12 w-12 text-blue-600"
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

            <h2 className="mb-4 text-2xl font-bold text-gray-900">Dashboard en Construcción 🚧</h2>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              Esta página estará disponible pronto. Aquí podrás subir videos, ver tus conversiones y
              gestionar tu contenido.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="primary" disabled>
                Subir Video (Próximamente)
              </Button>
              <Button variant="outline" disabled>
                Ver Mis Videos (Próximamente)
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-6 w-6 shrink-0 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="mb-1 font-semibold text-gray-900">MVP en desarrollo</h3>
                <p className="text-sm text-gray-600">
                  Estamos trabajando en las funcionalidades de carga y procesamiento de videos.
                  Pronto podrás convertir tus videos a formato vertical.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
