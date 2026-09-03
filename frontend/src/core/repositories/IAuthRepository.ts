import type { Utilisateur, LoginCredentials, AuthResponse } from '../entities/Utilisateur';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<Utilisateur>;
  getStoredToken(): string | null;
  saveToken(token: string): void;
  removeToken(): void;
}