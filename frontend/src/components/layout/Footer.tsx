import { Link } from 'react-router';
import Logo from '../../assets/logo.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <img src={Logo} alt="logo" />
              <span className="text-xl font-bold text-gray-900">ClipFlow</span>
            </div>
            <p className="text-sm text-pretty text-gray-600">
              Convierte tus videos horizontales en shorts verticales automáticamente.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Producto</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="hover:text-primary-600 text-sm text-gray-600 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-primary-600 text-sm text-gray-600 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="hover:text-primary-600 text-sm text-gray-600 transition-colors">
                  Términos de uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-600 text-sm text-gray-600 transition-colors">
                  Privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-pretty text-gray-600">
            © {currentYear} VideoShorts. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
