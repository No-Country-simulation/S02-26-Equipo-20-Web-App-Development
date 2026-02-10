export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },

  // Videos
  VIDEOS: {
    LIST: '/videos',
    UPLOAD: '/videos/upload',
    DETAIL: (id: string) => `/videos/${id}`,
    DELETE: (id: string) => `/videos/${id}`,
    DOWNLOAD: (id: string) => `/videos/${id}/download`,
    STATUS: (id: string) => `/videos/${id}/status`,
  },

  // Shorts (videos generados)
  SHORTS: {
    LIST: (videoId: string) => `/videos/${videoId}/shorts`,
    DETAIL: (videoId: string, shortId: string) => `/videos/${videoId}/shorts/${shortId}`,
    DOWNLOAD: (videoId: string, shortId: string) => `/videos/${videoId}/shorts/${shortId}/download`,
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    CHANGE_PASSWORD: '/user/password',
  },
} as const;

// Helper para construir URLs con query params
export function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): string {
  if (!params) return endpoint;

  const queryString = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  return `${endpoint}?${queryString}`;
}
