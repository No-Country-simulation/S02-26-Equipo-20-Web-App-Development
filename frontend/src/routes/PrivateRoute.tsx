import { Navigate, Outlet } from 'react-router';
import { LoadingOverlay } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente para proteger rutas privadas
 * Solo usuarios autenticados pueden acceder
 *
 * @example
 * // En el router:
 * {
 *   element: <PrivateRoute />,
 *   children: [
 *     { path: 'dashboard', element: <Dashboard /> },
 *     { path: 'profile', element: <Profile /> },
 *   ]
 * }
 */
export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras verifica la sesión, mostrar loader
  if (isLoading) {
    return <LoadingOverlay text="Cargando..." />;
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar las rutas hijas
  return <Outlet />;
}
