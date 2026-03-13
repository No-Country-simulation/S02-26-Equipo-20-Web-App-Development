import { env } from '@/config/env';
import { dispatchUnauthorized } from '@/lib/authEvents';
import axios, { AxiosError } from 'axios';

const API_URL = env.apiUrl;

/**
 * Instancia de axios configurada para autenticación con cookies
 * El token JWT se envía automáticamente en las cookies (HttpOnly)
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enviar cookies automáticamente en cada request
});

// Response interceptor - Manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Manejar errores comunes
    if (error.response) {
      const url = error.config?.url ?? '';
      const isAuthCheck = url.includes('/auth/me');
      const isRegister = url.includes('/auth/register');
      const isOnAuthPage =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');
      switch (error.response.status) {
        case 401:
          if (!isAuthCheck && !isOnAuthPage) {
            dispatchUnauthorized();
          }
          break;
        case 403:
          if (!isAuthCheck && !isRegister && !isOnAuthPage) {
            dispatchUnauthorized();
          }
          break;
        case 404:
        case 500:
        default:
          console.error('Error en la petición:', error.response.data);
      }
    }
    return Promise.reject(error);
  },
);

// Helper para manejar errores de forma tipada
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'Error desconocido';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido';
}

export default api;
