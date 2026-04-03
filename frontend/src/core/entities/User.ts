// frontend/src/core/entities/User.ts

export type UserRole =
  | 'admin'
  | 'medecin'
  | 'interne'
  | 'stagiaire'
  | 'infirmier'
  | 'secretaire';

export interface User {
  id_user:             number;
  nom:                 string;
  prenom:              string;
  email:               string;
  role:                UserRole;
  specialite?:         string | null;
  telephone?:          string | null;
  actif?:              boolean;
  statut?:             'actif' | 'inactif' | 'suspendu';
  premier_connexion?:  boolean; // ✅ true = doit changer son mot de passe
  created_at?:         Date;
  updated_at?:         Date;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface AuthResponse {
  user:              User;
  token:             string;
  premier_connexion?: boolean; // ✅ retourné par le backend au login
}