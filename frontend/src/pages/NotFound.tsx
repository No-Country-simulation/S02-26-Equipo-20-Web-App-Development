import { Link } from 'react-router';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-lg text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="h-32 w-32 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="mb-8 text-lg text-gray-600">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Botones */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/">
            <Button variant="primary">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Volver al Inicio
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Ir al Dashboard</Button>
          </Link>
        </div>

        {/* Sugerencias */}
        <div className="mt-12 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">¿Buscabas algo más?</h2>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/dashboard">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 transition-colors hover:text-blue-700">
                Dashboard
              </span>
            </Link>
            <Link to="/profile">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 transition-colors hover:text-blue-700">
                Mi Perfil
              </span>
            </Link>
            <Link to="/">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600 transition-colors hover:text-blue-700">
                Inicio
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
