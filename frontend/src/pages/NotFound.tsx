import { Link } from 'react-router';
import { Frown, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 py-10">
      <div className="max-w-lg text-center">
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Frown className="h-32 w-32 text-gray-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="mb-8 text-lg text-balance text-gray-600">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/">
            <Button variant="primary" className="gap-2">
              <Home className="h-5 w-5" />
              Volver al Inicio
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Ir al Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
