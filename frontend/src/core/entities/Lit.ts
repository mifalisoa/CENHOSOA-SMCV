// frontend/src/core/entities/Lit.ts
//
// Miroir de backend/src/domain/entities/Lit.ts.
// Ce fichier etait vide cote front, ce qui cassait ILitRepository.ts, LitRepository.ts
// et useLits.ts (tous les trois importent depuis ce module).
//
// Structure alignee sur la table lit reelle :
//   id_lit, numero_lit, etage, chambre, service_lit, type_lit, statut_lit, actif_lit,
//   remarques_lit, categorie

export interface Lit {
  id_lit: number;
  numero_lit: string;
  categorie: string;          // '1' | '2' | '3' | 'USIC'
  statut: string;             // mappe depuis statut_lit cote backend
  etage?: number | null;
  chambre?: string | null;
  service_lit?: string | null;
  type_lit?: string | null;
  actif_lit?: boolean;
  remarques_lit?: string | null;
}

// Payload envoye au POST /api/lits.
// numero_lit et categorie sont obligatoires cote backend (verifie dans LitController.createLit),
// les autres champs restent optionnels.
export interface CreateLitDTO {
  numero_lit: string;
  categorie: string;
  statut?: string;
  etage?: number | null;
  chambre?: string | null;
  service_lit?: string | null;
  type_lit?: string | null;
}

// Payload envoye au PUT /api/lits/:id. Tout est optionnel : mise a jour partielle.
export interface UpdateLitDTO {
  numero_lit?: string;
  categorie?: string;
  statut?: string;
  etage?: number | null;
  chambre?: string | null;
  service_lit?: string | null;
  type_lit?: string | null;
}

// Forme renvoyee par GET /api/lits (litService.getAllLitsWithOccupation()).
// patient_actuel est absent quand le lit est libre.
export interface LitWithOccupation extends Lit {
  patient_actuel?: {
    id_patient: number;
    nom_patient: string;
    prenom_patient: string;
    age: number;
    sexe_patient: string;
    diagnostic: string;
    date_admission: string; // recu en JSON, donc string (pas Date) tant que non parse
    duree_occupation_heures: number;
  };
}