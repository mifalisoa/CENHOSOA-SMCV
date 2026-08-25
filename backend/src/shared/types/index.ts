export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | {
    code?: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Aligné exactement avec le CHECK de la table utilisateurs
export type RoleType =
  | 'admin'
  | 'medecin'
  | 'interne'
  | 'stagiaire'
  | 'infirmier'
  | 'secretaire';

// Rôles autorisés à valider les actes des internes/stagiaires
export const ROLES_VALIDATEURS: RoleType[] = ['medecin', 'admin'];

// Rôles dont les actes nécessitent une validation
export const ROLES_NECESSITANT_VALIDATION: RoleType[] = ['interne', 'stagiaire'];

// ── Validation des actes ──────────────────────────────────────────────────────
export type StatutValidation = 'en_attente' | 'valide' | 'rejete';

export interface ValidateurInfo {
  valide_par?: number;
  valide_le?: string;
  valideur_nom?: string;
  valideur_prenom?: string;
  mode_garde: boolean;
}