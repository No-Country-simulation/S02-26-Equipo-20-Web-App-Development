import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/context/AuthProvider';
import { use } from 'react';

export function useAuth(): AuthContextType {
  const context = use(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}
