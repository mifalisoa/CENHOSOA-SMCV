// backend/src/domain/entities/Utilisateur.ts

export type UtilisateurRole =
  | 'admin'
  | 'medecin'
  | 'interne'
  | 'stagiaire'
  | 'infirmier'
  | 'secretaire';

export interface Utilisateur {
  id_user:                number;
  nom:                    string;
  prenom:                 string;
  email:                  string;
  mot_de_passe:           string;
  role:                   UtilisateurRole;
  specialite?:            string | null;
  telephone?:             string | null;
  actif:                  boolean;
  statut:                 'actif' | 'inactif' | 'suspendu';
  premier_connexion:      boolean;       // ✅ ajouté
  mot_de_passe_temporaire: boolean;      // ✅ ajouté
  created_at:             Date;
  derniere_connexion?:    Date | null;
  updated_at?:            Date | null;
}

export type CreateUtilisateurDTO = {
  nom:          string;
  prenom:       string;
  email:        string;
  mot_de_passe: string;
  role:         UtilisateurRole;
  specialite?:  string | null;
  telephone?:   string | null;
  statut?:      'actif' | 'inactif' | 'suspendu';
};

export type UpdateUtilisateurDTO = Partial<
  Omit<Utilisateur, 'id_user' | 'created_at' | 'mot_de_passe'>
>;

export type UtilisateurWithoutPassword = Omit<Utilisateur, 'mot_de_passe'>;