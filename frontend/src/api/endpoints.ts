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
    REPROCESS: (videoInputId: string) => `/video/reprocess-video/${videoInputId}`,
    ALL: '/video/all',
    STATUS: (idJob: string) => `/video/job-status/${idJob}`,
    STREAM: (videoOutputId: string) => `/video/output/${videoOutputId}`,
    STREAM_INPUT: (videoInputId: string) => `/video/input/${videoInputId}`,
    DOWNLOAD_OUTPUT: (videoOutputId: string) => `/video/output/${videoOutputId}/download`,
    DOWNLOAD_INPUT: (videoInputId: string) => `/video/input/${videoInputId}/download`,
    DELETE_INPUT: (videoInputId: string) => `/video/input/${videoInputId}`,
    DELETE_OUTPUT: (videoOutputId: string) => `/video/output/${videoOutputId}`,
    PROCESSING_JOBS: '/video/job-status/processing',
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
