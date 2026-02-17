import type { IAuthRepository } from '../../core/repositories/IAuthRepository';
import type { User, LoginCredentials, AuthResponse } from '../../core/entities/User';
import { httpClient } from '../http/axios.config';
import { TokenStorage } from '../storage/TokenStorage';

// 1. On définit la structure type d'une réponse de ton API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // ✅ On remplace <any> par la structure attendue : un token et un user
      const response = await httpClient.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/login', 
        {
          email: credentials.email,
           mot_de_passe: credentials.password,
        }
      );

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        TokenStorage.saveToken(token);
        TokenStorage.saveUser(user);
        
        return {
          user,
          accessToken: token,
          refreshToken: '',
        };
      }
      throw new Error(response.data.message || 'Erreur de connexion');
    } catch (error: unknown) {
      // ✅ Gestion propre de l'erreur sans 'any'
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        const message = axiosError.response?.data?.error || 'Erreur de connexion';
        throw new Error(message);
      }
      
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(message);
    }
  }

  async logout(): Promise<void> {
    TokenStorage.removeToken();
    TokenStorage.removeUser();
  }

  async getCurrentUser(): Promise<User> {
    // ✅ On spécifie que le data contient un User
    const response = await httpClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  getStoredToken() { return TokenStorage.getToken(); }
  saveToken(token: string) { TokenStorage.saveToken(token); }
  removeToken() { TokenStorage.removeToken(); }
}