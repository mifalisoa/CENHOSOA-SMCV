// frontend/src/presentation/store/AuthTypes.ts

import { createContext } from 'react';
import type { Utilisateur } from '../../core/entities/Utilisateur';

export interface AuthContextType {
  user:            Utilisateur | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  isInitializing:  boolean;
  login:           (email: string, password: string) => Promise<{ premier_connexion: boolean }>; // ✅
  logout:          () => Promise<void>;
  refreshUser:     () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);