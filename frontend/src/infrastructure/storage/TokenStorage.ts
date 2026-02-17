const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export class TokenStorage {
  /**
   * Sauvegarder le token JWT
   */
  static saveToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('💾 [TokenStorage] Token sauvegardé');
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur sauvegarde token:', error);
    }
  }

  /**
   * Récupérer le token JWT
   */
  static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur récupération token:', error);
      return null;
    }
  }

  /**
   * Supprimer le token JWT
   */
  static removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ [TokenStorage] Token supprimé');
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur suppression token:', error);
    }
  }

  /**
   * Sauvegarder les données utilisateur
   */
  static saveUser(user: any): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('💾 [TokenStorage] Utilisateur sauvegardé');
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur sauvegarde user:', error);
    }
  }

  /**
   * Récupérer les données utilisateur
   */
  static getUser(): any {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur récupération user:', error);
      return null;
    }
  }

  /**
   * Supprimer les données utilisateur
   */
  static removeUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
      console.log('🗑️ [TokenStorage] Utilisateur supprimé');
    } catch (error) {
      console.error('❌ [TokenStorage] Erreur suppression user:', error);
    }
  }

  /**
   * Tout nettoyer
   */
  static clear(): void {
    this.removeToken();
    this.removeUser();
    console.log('🧹 [TokenStorage] Storage nettoyé');
  }
}