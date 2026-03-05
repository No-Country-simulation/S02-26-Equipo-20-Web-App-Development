import { Outlet, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/hooks/useAuth';

/**
 * Layout principal de la aplicación
 * Incluye Header, Footer y Toaster para notificaciones
 */
export function Layout() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Páginas que no deben mostrar Header/Footer (solo auth pages)
  const noLayoutPages = ['/login', '/register'];
  const showLayout = !noLayoutPages.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header (solo en páginas internas como Dashboard, Profile) */}
      {showLayout && (
        <Header isAuthenticated={isAuthenticated} userName={user?.name} onLogout={logout} />
      )}

      {/* Contenido principal */}
      <main className={showLayout ? 'flex-1' : ''}>
        <Outlet />
      </main>

      {/* Footer (solo en páginas internas) */}
      {showLayout && <Footer />}

      {/* Toaster para notificaciones */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </div>
  );
}
