export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    UPDATE_PROFILE: '/users/me',
  },
  VIDEOS: {
    UPLOAD: '/video/process-video',
    ALL: '/video/all',
    STATUS: (idJob: string) => `/video/job-status/${idJob}`,
    STREAM: (videoOutputId: string) => `/video/output/${videoOutputId}`,
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
