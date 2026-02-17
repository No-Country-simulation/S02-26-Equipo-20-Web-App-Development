import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';
import api from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import type { User } from '@/types/user.types';

/**
 * Servicio de autenticación (Cookie-based)
 * WORKAROUND: Backend no devuelve el user en el body, solo setea la cookie
 */
export const authService = {
  /**
   * Login de usuario
   * WORKAROUND: Backend devuelve body vacío, creamos user fake temporalmente
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGIN, data);

      // TODO: Backend debe devolver el user en el body
      // Por ahora, creamos un user temporal con el email
      const tempUser: User = {
        id: Date.now(), // ID temporal
        name: 'Usuario',
        lastname: 'Demo',
        email: data.email,
        country: 'Argentina',
      };

      localStorage.setItem('user', JSON.stringify(tempUser));

      return {
        user: tempUser,
        token: '',
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Registro de usuario
   * WORKAROUND: Backend devuelve body vacío, creamos user fake temporalmente
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      await api.post(API_ENDPOINTS.AUTH.REGISTER, data);

      // TODO: Backend debe devolver el user en el body
      // Por ahora, creamos un user temporal con los datos del registro
      const tempUser: User = {
        id: Date.now(), // ID temporal
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        country: data.country,
      };

      localStorage.setItem('user', JSON.stringify(tempUser));

      return {
        user: tempUser,
        token: '',
      };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Obtener datos del usuario actual
   * TODO: Implementar cuando backend tenga /auth/me
   */
  async me(): Promise<User> {
    const user = this.getStoredUser();
    if (!user) throw new Error('No hay usuario autenticado');
    return user;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
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
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    return !!this.getStoredUser();
  },
};
