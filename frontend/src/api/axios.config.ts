import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Obtener URL base desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Agregar token a todas las requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Manejar errores comunes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token inválido o expirado
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('No tenés permisos para esta acción');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error del servidor');
          break;
        default:
          console.error('Error en la petición:', error.response.data);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    } else {
      console.error('Error al configurar la petición:', error.message);
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
