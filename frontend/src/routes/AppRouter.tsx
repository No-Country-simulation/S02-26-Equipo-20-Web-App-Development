import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout } from '@/components/layout/Layout';
import { PrivateRoute } from './PrivateRoute';

// Páginas (las crearemos después)
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

/**
 * Configuración de rutas de la aplicación
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Rutas públicas
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },

      // Rutas privadas (requieren autenticación)
      {
        element: <PrivateRoute />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
        ],
      },

      // Ruta 404
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

/**
 * Componente principal del router
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
