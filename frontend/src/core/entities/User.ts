// frontend/src/core/entities/User.ts

export type UserRole =
  | 'admin'
  | 'medecin'
  | 'interne'
  | 'stagiaire'
  | 'infirmier'
  | 'secretaire';

// LEÇON : Exporter le type séparément permet de l'utiliser partout
// sans répéter la liste des rôles (App.tsx, ProtectedRoute, etc.)

export interface User {
  id_user:     number;
  nom:         string;
  prenom:      string;
  email:       string;
  role:        UserRole;
  specialite?: string | null;
  telephone?:  string | null;
  actif?:      boolean;
  statut?:     'actif' | 'inactif' | 'suspendu';
  created_at?: Date;
  updated_at?: Date;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface AuthResponse {
  user:  User;
  token: string;
}