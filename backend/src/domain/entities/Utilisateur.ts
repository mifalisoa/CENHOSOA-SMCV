export interface Utilisateur {
    id_user: number;
    nom_user: string;
    prenom_user: string;
    email_user: string;
    mdp_user: string;
    role_user: 'admin' | 'docteur' | 'secretaire';
    specialite_user?: string | null;
    tel_user?: string | null;
    actif_user: boolean;
    date_creation_user: Date;
    derniere_connexion?: Date | null;
}

export type CreateUtilisateurDTO = Omit<Utilisateur, 'id_user' | 'date_creation_user' | 'derniere_connexion' | 'actif_user'>;

export type UpdateUtilisateurDTO = Partial<Omit<Utilisateur, 'id_user' | 'date_creation_user' | 'mdp_user'>>;

export type UtilisateurWithoutPassword = Omit<Utilisateur, 'mdp_user'>;