import { Link } from 'react-router';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center space-x-2">
              <div className="bg-primary-600 flex h-8 w-8 items-center justify-center rounded-lg">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">VideoShorts</span>
            </div>
            <p className="text-sm text-gray-600">
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
          <p className="text-center text-sm text-gray-600">
            © {currentYear} VideoShorts. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
