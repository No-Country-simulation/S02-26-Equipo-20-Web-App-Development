import { createContext } from 'react';
import type { AuthContextType } from './AuthProvider';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
