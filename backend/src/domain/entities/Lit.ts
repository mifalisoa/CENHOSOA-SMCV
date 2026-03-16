// backend/src/domain/entities/Lit.ts
//
// Structure réelle de la table lit :
//   id_lit, numero_lit, etage (smallint), chambre, service_lit,
//   type_lit, statut_lit, actif_lit, remarques_lit, categorie

export interface Lit {
  id_lit:        number;
  numero_lit:    string;
  categorie:     string;          // '1' | '2' | '3' | 'USIC'
  statut:        string;          // mapped depuis statut_lit
  etage?:        number | null;
  chambre?:      string | null;
  service_lit?:  string | null;
  type_lit?:     string | null;
  actif_lit?:    boolean;
  remarques_lit?: string | null;
}

export interface CreateLitDTO {
  numero_lit:   string;
  categorie:    string;
  statut?:      string;
  etage?:       number | null;
  chambre?:     string | null;
  service_lit?: string | null;
  type_lit?:    string | null;
}

export interface UpdateLitDTO {
  numero_lit?:  string;
  categorie?:   string;
  statut?:      string;
  etage?:       number | null;
  chambre?:     string | null;
  service_lit?: string | null;
  type_lit?:    string | null;
}

export interface LitWithOccupation extends Lit {
  patient_actuel?: {
    id_patient:              number;
    nom_patient:             string;
    prenom_patient:          string;
    age:                     number;
    sexe_patient:            string;
    diagnostic:              string;
    date_admission:          Date;
    duree_occupation_heures: number;
  };
}