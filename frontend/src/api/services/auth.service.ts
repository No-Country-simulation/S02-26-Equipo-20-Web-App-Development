import api from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import type { User } from '@/types/user.types';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<User>(API_ENDPOINTS.AUTH.LOGIN, data);
    return { user: response.data };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<User>(API_ENDPOINTS.AUTH.REGISTER, data);
    return { user: response.data };
  },

  async me(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
};
