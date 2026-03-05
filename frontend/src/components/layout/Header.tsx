import { Link } from 'react-router';
import { Button } from '../ui/Button';
import Logo from '../../assets/logo.png';

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function Header({ isAuthenticated = false, userName, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={Logo} alt="logo" />
          <span className="text-xl font-bold text-gray-900">ClipFlow</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Mis videos
                </Button>
              </Link>

              <div className="flex items-center gap-3 border-l pl-4">
                <Link to="/profile">
                  <button className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                      <span className="text-primary-700 text-sm font-medium">
                        {userName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden text-sm font-medium text-gray-700 sm:block">
                      {userName}
                    </span>
                  </button>
                </Link>

                <Button variant="ghost" size="sm" onClick={onLogout}>
                  Salir
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
