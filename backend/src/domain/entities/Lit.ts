/**
 * Entité Lit - Correspond à la table lits de PostgreSQL
 */
export interface Lit {
  id_lit: number;
  numero_lit: string;
  categorie: string;
  statut: string;
  etage?: string | null;
  batiment?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateLitDTO {
  numero_lit: string;
  categorie: string;
  statut?: string;
  etage?: string | null;
  batiment?: string | null;
}

export interface UpdateLitDTO {
  numero_lit?: string;
  categorie?: string;
  statut?: string;
  etage?: string | null;
  batiment?: string | null;
}

export interface LitWithOccupation extends Lit {
  patient_actuel?: {
    id_patient: number;
    nom_patient: string;
    prenom_patient: string;
    age: number;
    sexe_patient: string;
    diagnostic: string;
    date_admission: Date;
    duree_occupation_heures: number;
  };
}