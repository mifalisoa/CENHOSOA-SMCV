export interface RendezVous {
    id_rdv: number;
    id_patient: number;
    id_docteur: number;
    date_rdv: Date;
    heure_rdv: string;
    duree_estimee: number;
    type_rdv?: 'consultation' | 'suivi' | 'urgence' | 'controle' | null;
    motif_rdv: string;
    statut_rdv: 'planifié' | 'confirmé' | 'terminé' | 'annulé' | 'absent';
    salle?: string | null;
    notes_rdv?: string | null;
    date_creation_rdv: Date;
    date_annulation?: Date | null;
    raison_annulation?: string | null;
}

export type CreateRendezVousDTO = Omit<RendezVous, 'id_rdv' | 'date_creation_rdv' | 'date_annulation' | 'raison_annulation'>;

export type UpdateRendezVousDTO = Partial<Omit<RendezVous, 'id_rdv' | 'id_patient' | 'id_docteur' | 'date_creation_rdv'>>;