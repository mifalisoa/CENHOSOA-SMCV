import { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../../core/entities/User';
import { loginUseCase, logoutUseCase, getCurrentUserUseCase } from '../../di/container';
import { TokenStorage } from '../../infrastructure/storage/TokenStorage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'utilisateur depuis le storage au montage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = TokenStorage.getToken();
        if (token) {
          const currentUser = await getCurrentUserUseCase.execute();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        TokenStorage.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUseCase.execute({ email: email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUseCase.execute();
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUserUseCase.execute();
      setUser(currentUser);
    } catch (error) {
      console.error('Erreur refresh user:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}