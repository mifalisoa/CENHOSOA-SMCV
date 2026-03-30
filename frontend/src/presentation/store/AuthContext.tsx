import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUseCase, logoutUseCase, getCurrentUserUseCase } from '../../di/container';
import { TokenStorage } from '../../infrastructure/storage/TokenStorage';
import { AuthContext } from './AuthTypes';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<import('../../core/entities/User').User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 🔄 Initialisation au montage (Refresh page)
  useEffect(() => {
    console.log('🔄 [AuthProvider] Montage du composant');
    const initAuth = async () => {
      console.log('🔍 [AuthProvider] Vérification du token initial...');
      try {
        const token = TokenStorage.getToken();
        if (token) {
          const currentUser = await getCurrentUserUseCase.execute();
          console.log('✅ [AuthProvider] Session restaurée:', currentUser.email, '| role:', currentUser.role);
          setUser(currentUser);
        } else {
          console.log('⚠️ [AuthProvider] Aucun token en stockage');
        }
      } catch (error) {
        console.error('❌ [AuthProvider] Échec restauration session:', error);
        TokenStorage.removeToken();
        setUser(null);
      } finally {
        console.log('✅ [AuthProvider] Initialisation terminée');
        setIsInitializing(false);
      }
    };

    initAuth();
  }, []);

  // 🔵 Action de Login
  const login = async (email: string, password: string) => {
    console.log('🔵 [AuthContext] login appelé pour:', email);
    setIsLoading(true);
    try {
      const response = await loginUseCase.execute({ email, password });
      console.log('🟢 [AuthContext] login réussi, user:', response.user.role);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 Action de Logout
  const logout = async () => {
    console.log('🚪 [AuthContext] logout appelé');
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

  // 🔄 Rafraîchir les données utilisateur
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isInitializing,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}