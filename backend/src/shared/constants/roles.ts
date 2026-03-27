// backend/src/shared/constants/roles.ts
//
// LEÇON : Centraliser les groupes de rôles évite la désynchronisation.
// Si on ajoute un rôle, on le met ici — tous les fichiers de routes
// sont mis à jour automatiquement.

export const ROLES_MEDICAUX   = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] as const;
export const ROLES_SOIGNANTS  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] as const;
export const ROLES_MEDECINS   = ['admin', 'medecin', 'interne'] as const; // création/modification
export const ROLES_INFIRMIERS = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier'] as const;
// secretaire — accès documents uniquement (géré séparément)
export const ROLES_DOCUMENTS  = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier', 'secretaire'] as const;