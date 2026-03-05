import { Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            Convierte videos en segundos
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-900 md:text-6xl">
            Transforma tus videos horizontales en{' '}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              shorts verticales
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Crea contenido vertical para TikTok, Instagram Reels y YouTube Shorts automáticamente.
            Sin edición manual, sin complicaciones.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button variant="primary" className="px-8 py-3 text-lg">
                {isAuthenticated ? 'Ir al Dashboard' : 'Empezar Gratis'}
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button variant="outline" className="px-8 py-3 text-lg">
                Cómo Funciona
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mx-auto grid max-w-2xl grid-cols-3 gap-8 border-t border-gray-200 pt-12">
            <div>
              <div className="mb-1 text-3xl font-bold text-gray-900">9:16</div>
              <div className="text-sm text-gray-600">Formato perfecto</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-gray-900">&lt;2min</div>
              <div className="text-sm text-gray-600">Tiempo de proceso</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Automático</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona Section */}
      <section id="como-funciona" className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Cómo Funciona</h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-600">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Sube tu video</h3>
              <p className="text-gray-600">
                Arrastra tu video horizontal o selecciónalo desde tu dispositivo
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-2xl font-bold text-purple-600">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Procesamiento automático</h3>
              <p className="text-gray-600">
                Nuestra IA detecta lo importante y crea el formato vertical
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Descarga y comparte</h3>
              <p className="text-gray-600">
                Recibe tus shorts listos para publicar en todas las plataformas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-linear-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">¿Listo para crear contenido viral?</h2>
          <p className="mb-8 text-xl text-blue-100">
            Únete a cientos de creadores que ya están usando VideoShorts
          </p>
          <Link to={isAuthenticated ? '/dashboard' : '/register'}>
            <Button variant="secondary" className="px-8 py-3 text-lg">
              {isAuthenticated ? 'Ir al Dashboard' : 'Comenzar Ahora'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
