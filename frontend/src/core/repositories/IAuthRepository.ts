import type { User, LoginCredentials, AuthResponse } from '../entities/User';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  getStoredToken(): string | null;
  saveToken(token: string): void;
  removeToken(): void;
}