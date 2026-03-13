# ClipFlow — Frontend

Interfaz web de ClipFlow, construida con React 19 y TypeScript. Permite subir videos horizontales, configurar opciones de procesamiento y descargar los shorts verticales generados.

## Stack

| Tecnología      | Versión | Uso                         |
| --------------- | ------- | --------------------------- |
| React           | 19      | UI                          |
| TypeScript      | 5       | Tipado estático             |
| Vite            | 7       | Bundler y dev server        |
| Tailwind CSS    | v4      | Estilos                     |
| TanStack Query  | v5      | Server state y caché        |
| React Router    | v7      | Routing                     |
| React Hook Form | —       | Formularios                 |
| Zod             | —       | Validación de esquemas      |
| Axios           | —       | HTTP client con interceptor |
| Sonner          | —       | Notificaciones toast        |
| Lucide React    | —       | Íconos                      |

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8080`

## Instalación
```bash
cd frontend
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del frontend:
```
VITE_API_URL=http://localhost:8080/api/v1
```

> La app valida esta variable al iniciar y falla en desarrollo si no está definida.

## Desarrollo
```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

## Build
```bash
npm run build
```

El output se genera en `dist/`.

## Estructura del proyecto
```
src/
  api/               → Configuración de Axios y endpoints centralizados
  components/
    features/        → Componentes de dominio (VideoCard, UploadModal, JobPoller...)
    layout/          → Header, Footer, Layout
    ui/              → Componentes base reutilizables (Button, Input, Modal...)
  config/            → Validación de variables de entorno
  constants/         → Constantes de dominio
  context/           → AuthContext y AuthProvider
  hooks/             → Custom hooks (autenticación, videos, jobs, polling...)
  lib/               → Utilidades internas (queryClient, storage, authEvents)
  pages/             → Vistas por ruta
  routes/            → AppRouter, PrivateRoute, PublicRoute
  types/             → Tipos TypeScript de dominio
  utils/             → Helpers y esquemas de validación Zod
```

## Decisiones técnicas relevantes

- **Autenticación**: JWT via cookies HttpOnly. El frontend no gestiona tokens directamente.
- **Rutas protegidas**: `PrivateRoute` redirige usuarios no autenticados a `/login`. `PublicRoute` redirige usuarios ya autenticados a `/dashboard`.
- **Estado del servidor**: TanStack Query v5 para caché y sincronización. Sin `onError` global en el QueryClient para evitar toasts duplicados.
- **Polling de jobs**: `JobPoller` es un componente sin render que ejecuta polling sobre los jobs activos. Al montar sincroniza con `GET /video/job-status/processing`.
- **Errores 401/403**: El interceptor de Axios despacha un `CustomEvent` que el `AuthProvider` escucha para redirigir sin usar `window.location.href`.
- **localStorage**: Todo acceso centralizado en `lib/storage.ts` con funciones tipadas.
- **Variables de entorno**: Solo se accede a `import.meta.env` desde `config/env.ts`.