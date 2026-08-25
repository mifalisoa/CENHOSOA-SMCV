// Entite Admission - miroir du type backend (domain/entities/Admission.ts)
// Toute modification de structure doit etre faite en synchronisation avec le backend

export interface Admission {
  id_admission: number;
  id_patient: number;
  id_docteur: number;
  id_secretaire: number;
  id_lit?: number | null;
  num_admission: string;
  date_admission: string;
  motif_admission: string;
  diagnostic_entree: string;
  type_admission: 'urgence' | 'programmee' | 'transfert';
  statut_admission: 'en_cours' | 'sortie';
  date_sortie_prevue?: string | null;
  remarques_admission?: string | null;
  nom_patient?: string;
  prenom_patient?: string;
  num_dossier?: string;
  nom_docteur?: string;
  prenom_docteur?: string;
  numero_lit?: string;
  service_lit?: string;
}

export type CreateAdmissionDTO = Omit<Admission, 'id_admission' | 'date_admission' | 'num_admission' | 'nom_patient' | 'prenom_patient' | 'num_dossier' | 'nom_docteur' | 'prenom_docteur' | 'numero_lit' | 'service_lit'>;

export type UpdateAdmissionDTO = Partial<Omit<Admission, 'id_admission' | 'num_admission' | 'date_admission' | 'id_patient'>>;