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
    console.log('🔵 [AuthRepository] login appelé avec:', credentials.email);

    try {
      const response = await httpClient.post<ApiResponse<{
        token:             string;
        user:              User;
        premier_connexion?: boolean; // ✅ ajouté
      }>>(
        '/auth/login',
        { email: credentials.email, mot_de_passe: credentials.password }
      );

      console.log('🟢 [AuthRepository] Réponse reçue:', response.data);

      if (response.data.success && response.data.data) {
        const { token, user, premier_connexion } = response.data.data;

        console.log('💾 [AuthRepository] Sauvegarde token pour:', user.email, '| role:', user.role);
        console.log('🔍 DEBUG premier_connexion:', premier_connexion, '| data complet:', JSON.stringify(response.data.data));

        this.saveToken(token);

        // ✅ Sauvegarde premier_connexion dans l'objet user pour le contexte
        const userAvecFlag: User = { ...user, premier_connexion: premier_connexion ?? false };
        TokenStorage.saveUser(userAvecFlag);

        const persistedToken = TokenStorage.getToken();
        console.log('💾 [AuthRepository] Token persisté:', persistedToken?.substring(0, 20) + '...');

        // ✅ Retourne premier_connexion pour que AuthContext puisse rediriger
        return { user: userAvecFlag, token, premier_connexion };
      }

      throw new Error(response.data.message || 'Erreur de connexion');
    } catch (error: unknown) {
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

  getStoredToken(): string | null { return TokenStorage.getToken(); }
  saveToken(token: string): void  { TokenStorage.saveToken(token); }
  removeToken(): void             { TokenStorage.removeToken(); }
}