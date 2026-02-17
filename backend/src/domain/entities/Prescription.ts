export interface Prescription {
    id_prescription: number;
    id_admission: number;
    id_docteur: number;
    date_prescription: Date;
    type_prescription: 'médicament' | 'bilan' | 'soin';
    nom_medicament?: string | null;
    dosage?: string | null;
    voie_administration?: 'orale' | 'IV' | 'IM' | 'SC' | 'cutanée' | null;
    frequence?: string | null;
    duree_traitement?: string | null;
    nom_bilan?: string | null;
    indication_bilan?: string | null;
    instructions?: string | null;
    modifications_traitement?: string | null;
}

export type CreatePrescriptionDTO = Omit<Prescription, 'id_prescription' | 'date_prescription'>;

export type UpdatePrescriptionDTO = Partial<Omit<Prescription, 'id_prescription' | 'id_admission' | 'id_docteur' | 'date_prescription'>>;