import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';
import api from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import type { User } from '@/types/user.types';

/**
 * Servicio de autenticación
 * Todas las llamadas relacionadas con auth
 */
export const authService = {
  /**
   * Login de usuario
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);

    // Guardar token en localStorage
    localStorage.setItem('auth_token', response.data.token);

    // Convertir UserPublic a User antes de guardar
    const fullUser: User = {
      ...response.data.user,
    };
    localStorage.setItem('user', JSON.stringify(fullUser));

    return response.data;
  },

  /**
   * Registro de usuario
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);

    // Guardar token en localStorage
    localStorage.setItem('auth_token', response.data.token);

    // Convertir UserPublic a User antes de guardar
    const fullUser: User = {
      ...response.data.user,
    };
    localStorage.setItem('user', JSON.stringify(fullUser));

    return response.data;
  },

  /**
   * Obtener datos del usuario actual
   */
  async me(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);

    // Actualizar usuario en localStorage
    localStorage.setItem('user', JSON.stringify(response.data));

    return response.data;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continuar con logout local incluso si falla el servidor
      console.error('Error al hacer logout:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Obtener usuario guardado en localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Obtener token guardado en localStorage
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  },
};
