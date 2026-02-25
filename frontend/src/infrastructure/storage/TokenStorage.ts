import type { User } from '../../core/entities/User';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export class TokenStorage {
  /**
   * Sauvegarder le token JWT
   */
  static saveToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur sauvegarde token:', error);
    }
  }

  static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }

  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Sauvegarder les données utilisateur (Type User strict)
   */
  static saveUser(user: User): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur sauvegarde user:', error);
    }
  }

  /**
   * Récupérer les données utilisateur typées
   */
  static getUser(): User | null {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? (JSON.parse(user) as User) : null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }

  static removeUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  static clear(): void {
    this.removeToken();
    this.removeUser();
  }
}