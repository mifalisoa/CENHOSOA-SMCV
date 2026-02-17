export interface Lit {
    id_lit: number;
    numero_lit: string;
    etage?: number | null;
    chambre?: string | null;
    service_lit: string;
    type_lit?: 'standard' | 'soins_intensifs' | 'VIP' | null;
    statut_lit: 'disponible' | 'occupé' | 'maintenance' | 'réservé';
    actif_lit: boolean;
    remarques_lit?: string | null;
}

export type CreateLitDTO = Omit<Lit, 'id_lit'>;
export type UpdateLitDTO = Partial<Omit<Lit, 'id_lit' | 'numero_lit'>>;