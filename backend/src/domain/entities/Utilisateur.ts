// backend/src/domain/entities/Utilisateur.ts

export interface Utilisateur {
    id_user: number;           // PK — inchangé, les FK des autres tables pointent dessus
    nom: string;               // était nom_user
    prenom: string;            // était prenom_user
    email: string;             // était email_user
    mot_de_passe: string;      // était mdp_user
    role: 'admin' | 'medecin' | 'infirmier' | 'secretaire' | 'pharmacien'; // était 'docteur'
    specialite?: string | null; // était specialite_user
    telephone?: string | null;  // était tel_user
    actif: boolean;             // était actif_user — gardé pour compatibilité
    statut: 'actif' | 'inactif' | 'suspendu'; // nouveau champ textuel
    created_at: Date;           // était date_creation_user
    derniere_connexion?: Date | null;
    updated_at?: Date | null;
}

// DTO création — on n'envoie jamais id_user, created_at, derniere_connexion, statut par défaut
export type CreateUtilisateurDTO = {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe: string;
    role: Utilisateur['role'];
    specialite?: string | null;
    telephone?: string | null;
    statut?: Utilisateur['statut']; // optionnel, défaut 'actif' côté DB
};

// DTO mise à jour — tout optionnel sauf id_user et mot_de_passe (géré séparément)
export type UpdateUtilisateurDTO = Partial<Omit<Utilisateur, 'id_user' | 'created_at' | 'mot_de_passe'>>;

// Vue sans mot de passe — utilisée dans les listes et réponses API
export type UtilisateurWithoutPassword = Omit<Utilisateur, 'mot_de_passe'>;