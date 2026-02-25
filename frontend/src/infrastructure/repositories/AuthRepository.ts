import type { IAuthRepository } from '../../core/repositories/IAuthRepository';
import type { User, LoginCredentials, AuthResponse } from '../../core/entities/User';
import { httpClient } from '../http/axios.config';
import { TokenStorage } from '../storage/TokenStorage';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export class AuthRepository implements IAuthRepository {
  /**
   * Connexion de l'utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/login', 
        {
          email: credentials.email,
          mot_de_passe: credentials.password,
        }
      );

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // On utilise les méthodes de TokenStorage
        this.saveToken(token);
        TokenStorage.saveUser(user);
        
        return {
          user,
          accessToken: token,
          refreshToken: '', 
        };
      }
      throw new Error(response.data.message || 'Erreur de connexion');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        throw new Error(axiosError.response?.data?.error || 'Erreur de connexion');
      }
      throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    this.removeToken();
    TokenStorage.removeUser();
  }

  /**
   * Récupérer l'utilisateur actuel via l'API
   */
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  // --- Implémentation des méthodes manquantes exigées par IAuthRepository ---

  /**
   * Récupérer le token stocké
   */
  getStoredToken(): string | null {
    return TokenStorage.getToken();
  }

  /**
   * Sauvegarder un token (Exigé par IAuthRepository)
   */
  saveToken(token: string): void {
    TokenStorage.saveToken(token);
  }

  /**
   * Supprimer le token (Exigé par IAuthRepository)
   */
  removeToken(): void {
    TokenStorage.removeToken();
  }
}