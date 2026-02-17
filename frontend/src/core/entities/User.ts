export interface User {
  id_user: number;
  nom_user: string;
  prenom_user: string;
  email_user: string;
  role_user: 'admin' | 'docteur' | 'secretaire';
  specialite_user?: string | null;
  tel_user?: string | null;
  actif_user?: boolean;
  date_creation_user?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}