import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from 'sonner';

interface LayoutProps {
  isAuthenticated?: boolean;
  userEmail?: string;
  onLogout?: () => void;
}

export function Layout({ isAuthenticated, userEmail, onLogout }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} userEmail={userEmail} onLogout={onLogout} />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}
