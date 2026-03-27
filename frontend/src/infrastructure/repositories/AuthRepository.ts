// frontend/src/infrastructure/repositories/AuthRepository.ts

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
    try {
      const response = await httpClient.post<ApiResponse<{ token: string; user: User }>>(
        '/auth/login',
        { email: credentials.email, mot_de_passe: credentials.password }
      );

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        this.saveToken(token);
        TokenStorage.saveUser(user);
        return { user, token };
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

  async logout(): Promise<void> {
    this.removeToken();
    TokenStorage.removeUser();
  }

  // GET /auth/me retourne maintenant directement l'objet user (plus de { user: ... })
  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
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