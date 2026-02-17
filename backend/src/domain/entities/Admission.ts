export interface Admission {
    id_admission: number;
    id_patient: number;
    id_docteur: number;
    id_secretaire: number;
    id_lit?: number | null;
    num_admission: string;
    date_admission: Date;
    motif_admission: string;
    diagnostic_entree: string;
    type_admission: 'urgence' | 'programmée' | 'transfert';
    statut_admission: 'en_cours' | 'sortie';
    date_sortie_prevue?: Date | null;
    remarques_admission?: string | null;
}

export type CreateAdmissionDTO = Omit<Admission, 'id_admission' | 'date_admission' | 'num_admission'>;

export type UpdateAdmissionDTO = Partial<Omit<Admission, 'id_admission' | 'num_admission' | 'date_admission' | 'id_patient'>>;