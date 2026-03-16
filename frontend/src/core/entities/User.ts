// frontend/src/core/entities/User.ts

export interface User {
  id_user:      number;
  nom:          string;   // était nom_user
  prenom:       string;   // était prenom_user
  email:        string;   // était email_user
  role:         'admin' | 'medecin' | 'infirmier' | 'secretaire' | 'pharmacien'; // était 'docteur'
  specialite?:  string | null;  // était specialite_user
  telephone?:   string | null;  // était tel_user
  actif?:       boolean;        // était actif_user
  statut?:      'actif' | 'inactif' | 'suspendu';
  created_at?:  Date;           // était date_creation_user
  updated_at?:  Date;
}

export interface LoginCredentials {
  email:    string;
  password: string;
}

export interface AuthResponse {
  user:         User;
  token:        string;  // le backend retourne "token", pas accessToken/refreshToken
}