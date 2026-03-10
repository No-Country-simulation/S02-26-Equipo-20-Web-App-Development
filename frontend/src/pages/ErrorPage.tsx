import { Link, useRouteError, isRouteErrorResponse } from 'react-router';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Ocurrió un error inesperado';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Algo salió mal</h1>
        <p className="mb-6 text-sm text-gray-500">{message}</p>
        <Link to="/dashboard">
          <Button variant="primary">Volver al Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
