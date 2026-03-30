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

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // 🔵 ÉTAPE 1 : Appel initial (Vérifie que le clic UI arrive jusqu'ici)
    console.log('🔵 [AuthRepository] login appelé avec:', credentials.email);

    try {
      // 🚀 ÉTAPE 2 : Requête vers le Backend
      const response = await httpClient.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/login',
        { email: credentials.email, mot_de_passe: credentials.password }
      );

      // 🟢 ÉTAPE 3 : Réception de la réponse
      console.log('🟢 [AuthRepository] Réponse reçue:', response.data);

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // 💾 ÉTAPE 4 : Avant sauvegarde
        console.log('💾 [AuthRepository] Sauvegarde token pour:', user.email, '| role:', user.role);
        
        this.saveToken(token);
        TokenStorage.saveUser(user);
        
        // 🔍 ÉTAPE 5 : Vérification immédiate du Storage
        const persistedToken = TokenStorage.getToken();
        console.log('💾 [AuthRepository] Token persisté:', persistedToken?.substring(0, 20) + '...');
        
        return { user, token };
      }

      throw new Error(response.data.message || 'Erreur de connexion');
    } catch (error: unknown) {
      // 🔴 ÉTAPE D'ERREUR : Log du crash
      console.error('🔴 [AuthRepository] Erreur dans le bloc catch:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        throw new Error(axiosError.response?.data?.error || 'Erreur de connexion');
      }
      throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 [AuthRepository] Déconnexion');
    this.removeToken();
    TokenStorage.removeUser();
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await httpClient.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    } catch (error) {
      console.error('🔴 [AuthRepository] Erreur getCurrentUser:', error);
      throw error;
    }
  }

  getStoredToken(): string | null {
    return TokenStorage.getToken();
  }

  saveToken(token: string): void {
    TokenStorage.saveToken(token);
  }

  removeToken(): void {
    TokenStorage.removeToken();
  }
}