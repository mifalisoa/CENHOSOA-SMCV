export type StatutPrescription = 'en_attente' | 'valide' | 'refuse';

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
    cree_par_id?: number | null;
    statut: StatutPrescription;
    valide_par?: number | null;
    valide_le?: string | null;
    mode_garde: boolean;
    nom_docteur?: string;
    prenom_docteur?: string;
    valideur_nom?: string;
    valideur_prenom?: string;
    created_at: Date;
    updated_at: Date;
}

type PrescriptionExclusCreate = 'id_prescription' | 'date_prescription' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'mode_garde' | 'nom_docteur' | 'prenom_docteur' | 'valideur_nom' | 'valideur_prenom';

export type CreatePrescriptionDTO = Omit<Prescription, PrescriptionExclusCreate>;

type PrescriptionExclusUpdate = 'id_prescription' | 'id_admission' | 'id_docteur' | 'date_prescription' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'mode_garde' | 'nom_docteur' | 'prenom_docteur' | 'valideur_nom' | 'valideur_prenom';

export type UpdatePrescriptionDTO = Partial<Omit<Prescription, PrescriptionExclusUpdate>>;