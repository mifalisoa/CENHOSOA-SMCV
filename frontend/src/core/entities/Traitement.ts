export type TypeDocument = 'ordonnance' | 'traitement';

// ── Entité principale ─────────────────────────────────────────────────────────

export interface Traitement {
  id_traitement:   number;
  id_patient:      number;
  id_admission?:   number;

  // ✅ UUID partagé entre tous les médicaments d'une même prescription
  id_ordonnance?:  string;

  date_prescription:   Date | string;
  heure_prescription:  string;
  type_document:       TypeDocument;

  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;

  medicament:          string;
  dosage:              string;
  voie_administration: string;
  frequence:           string;
  duree:               string;

  instructions?:          string;
  observations_speciales?: string;

  created_at: Date | string;
  updated_at: Date | string;
}

// ── DTO création simple (rétrocompatibilité) ──────────────────────────────────

export interface CreateTraitementDTO {
  id_patient:          number;
  id_admission?:       number;
  date_prescription:   string;
  heure_prescription:  string;
  type_document:       TypeDocument;
  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;
  medicament:          string;
  dosage:              string;
  voie_administration: string;
  frequence:           string;
  duree:               string;
  instructions?:       string;
  observations_speciales?: string;
}

// ── DTO mise à jour ───────────────────────────────────────────────────────────

export interface UpdateTraitementDTO {
  date_prescription?:   string;
  heure_prescription?:  string;
  type_document?:       TypeDocument;
  diagnostic?:          string;
  prescripteur?:        string;
  lieu_prescription?:   string;
  medicament?:          string;
  dosage?:              string;
  voie_administration?: string;
  frequence?:           string;
  duree?:               string;
  instructions?:        string;
  observations_speciales?: string;
}

// ── DTO création multi-médicaments ────────────────────────────────────────────

// Un seul médicament dans une ordonnance
export interface MedicamentDTO {
  medicament:          string;
  dosage:              string;
  voie_administration: string;
  frequence:           string;
  duree:               string;
  instructions?:       string;
}

// Ordonnance complète avec N médicaments — envoyée au backend en une seule requête
export interface CreateOrdonnanceDTO {
  id_patient:          number;
  id_admission?:       number;
  date_prescription:   string;
  heure_prescription:  string;
  type_document:       TypeDocument;
  diagnostic?:         string;
  prescripteur?:       string;
  lieu_prescription?:  string;
  observations_speciales?: string;
  medicaments:         MedicamentDTO[];
}