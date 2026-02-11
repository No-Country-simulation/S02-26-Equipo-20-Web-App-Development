import { useState, useEffect, type ReactNode } from 'react';
import { authService } from '@/api/services/auth.service';
import type { User } from '@/types/user.types';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { AuthContext } from './AuthContext';

/**
 * Estado del contexto de autenticación
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Props del provider
 */
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al cargar la app, verificar si hay sesión guardada
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getStoredToken();

        if (storedUser && token) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error al inicializar auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
