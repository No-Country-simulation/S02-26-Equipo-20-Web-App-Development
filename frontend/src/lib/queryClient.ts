import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración global de TanStack Query
 * Best practices para React Query v5
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos" (5 minutos)
      staleTime: 1000 * 60 * 5,

      // Tiempo que los datos se mantienen en caché (10 minutos)
      gcTime: 1000 * 60 * 10,

      // Reintentar solo 1 vez en caso de error
      retry: 1,

      // Intervalo de reintento: 1 segundo
      retryDelay: 1000,

      // No refetch automático al enfocar ventana (para MVP)
      refetchOnWindowFocus: false,

      // No refetch automático al reconectar
      refetchOnReconnect: false,

      // No refetch automático al montar
      refetchOnMount: false,
    },
  },
});

/**
 * Query keys centralizadas
 * Esto ayuda a invalidar caché de forma consistente
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  videos: {
    all: ['videos'] as const,
    list: () => [...queryKeys.videos.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.videos.all, 'detail', id] as const,
    status: (id: string) => [...queryKeys.videos.all, 'status', id] as const,
  },
  shorts: {
    all: ['shorts'] as const,
    list: (videoId: string) => [...queryKeys.shorts.all, 'list', videoId] as const,
    detail: (videoId: string, shortId: string) =>
      [...queryKeys.shorts.all, 'detail', videoId, shortId] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
  },
} as const;
