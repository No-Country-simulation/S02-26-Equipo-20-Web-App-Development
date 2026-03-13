import { useState, useEffect, type ReactNode } from 'react';
import { authService } from '@/api/services/auth.service';
import type { User } from '@/types/user.types';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';
import { AuthContext } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import { useNavigate } from 'react-router';
import { authEvents, UNAUTHORIZED_EVENT } from '@/lib/authEvents';

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
  updateUser: (user: User) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      queryClient.clear();
      storage.clearAll();
      setUser(null);
      navigate('/login');
    };

    authEvents.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => authEvents.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [navigate, queryClient]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar si la cookie sigue siendo válida
        const user = await authService.me();
        setUser(user);
      } catch {
        // Cookie expirada o inexistente — no autenticado
        setUser(null);
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
    queryClient.clear(); // limpia todo el caché
    storage.clearAll();
    setUser(null);
    navigate('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user?.id,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}
