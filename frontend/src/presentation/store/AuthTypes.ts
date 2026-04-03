// frontend/src/presentation/store/AuthTypes.ts

import { createContext } from 'react';
import type { User } from '../../core/entities/User';

export interface AuthContextType {
  user:            User | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  isInitializing:  boolean;
  login:           (email: string, password: string) => Promise<{ premier_connexion: boolean }>; // ✅
  logout:          () => Promise<void>;
  refreshUser:     () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);