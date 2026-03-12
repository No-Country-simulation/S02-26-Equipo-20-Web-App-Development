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
import VideoDetail from '@/pages/VideoDetail';
import ErrorPage from '@/pages/ErrorPage';
import { AuthProvider } from '@/context/AuthProvider';
import { PublicRoute } from './PublicRoute';

/**
 * Configuración de rutas de la aplicación
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <Layout />
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'profile', element: <Profile /> },
          { path: 'videos/:id', element: <VideoDetail /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

/**
 * Componente principal del router
 */
export function AppRouter() {
  return <RouterProvider router={router} />;
}
