import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';
import api from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import type { User } from '@/types/user.types';

/**
 * Servicio de autenticación (Cookie-based)
 * El token JWT se maneja automáticamente en cookies HTTP-only
 * Solo guardamos el usuario en localStorage para acceso rápido
 */
export const authService = {
  /**
   * Login de usuario
   * El backend devuelve el user y setea el token en una cookie HTTP-only
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<{ user: User }>(API_ENDPOINTS.AUTH.LOGIN, data);

    // Solo guardar usuario (el token está en la cookie)
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return {
      user: response.data.user,
      token: '', // El token está en la cookie HTTP-only, no lo necesitamos aquí
    };
  },

  /**
   * Registro de usuario
   * El backend devuelve el user y setea el token en una cookie HTTP-only
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<{ user: User }>(API_ENDPOINTS.AUTH.REGISTER, data);

    // Solo guardar usuario (el token está en la cookie)
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return {
      user: response.data.user,
      token: '',
    };
  },

  /**
   * Obtener datos del usuario actual
   * TODO: Implementar cuando backend tenga /auth/me
   */
  async me(): Promise<User> {
    // Por ahora retornar del localStorage
    const user = this.getStoredUser();
    if (!user) throw new Error('No hay usuario autenticado');
    return user;

    // Cuando el backend tenga /auth/me:
    // const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
    // localStorage.setItem('user', JSON.stringify(response.data));
    // return response.data;
  },

  /**
   * Logout
   * El backend limpia la cookie automáticamente
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      // Limpiar localStorage
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
   * Como usamos cookies HTTP-only, verificamos si hay usuario en localStorage
   */
  isAuthenticated(): boolean {
    return !!this.getStoredUser();
  },
};
