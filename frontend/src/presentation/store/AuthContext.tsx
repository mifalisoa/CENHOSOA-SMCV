import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUseCase, logoutUseCase, getCurrentUserUseCase } from '../../di/container';
import { TokenStorage } from '../../infrastructure/storage/TokenStorage';
import { AuthContext } from './AuthTypes';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user,           setUser]           = useState<import('../../core/entities/User').User | null>(null);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialisation au montage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = TokenStorage.getToken();
        if (token) {
          const currentUser = await getCurrentUserUseCase.execute();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('❌ [AuthProvider] Échec restauration session:', error);
        TokenStorage.removeToken();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // ✅ Login — retourne { premier_connexion } pour que LoginPage redirige
  const login = async (email: string, password: string): Promise<{ premier_connexion: boolean }> => {
    setIsLoading(true);
    try {
      const response = await loginUseCase.execute({ email, password });
      setUser(response.user);
      return { premier_connexion: response.premier_connexion ?? false };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUseCase.execute();
      setUser(null);
    } catch (error) {
      console.error('❌ [AuthContext] Erreur lors du logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rafraîchir les données utilisateur
  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUserUseCase.execute();
      setUser(currentUser);
    } catch (error) {
      console.error('❌ [AuthContext] Erreur refresh user:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isInitializing, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}