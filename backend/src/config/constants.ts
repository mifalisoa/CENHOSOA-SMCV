export const ROLES = {
    ADMIN: 'admin',
    DOCTEUR: 'docteur',
    SECRETAIRE: 'secretaire',
} as const;

export const STATUT_PATIENT = {
    EXTERNE: 'externe',
    HOSPITALISE: 'hospitalisé',
    SORTI: 'sorti',
} as const;

export const STATUT_ADMISSION = {
    EN_COURS: 'en_cours',
    SORTIE: 'sortie',
} as const;

export const TYPE_ADMISSION = {
    URGENCE: 'urgence',
    PROGRAMMEE: 'programmée',
    TRANSFERT: 'transfert',
} as const;

export const STATUT_RDV = {
    PLANIFIE: 'planifié',
    CONFIRME: 'confirmé',
    TERMINE: 'terminé',
    ANNULE: 'annulé',
    ABSENT: 'absent',
} as const;

export const TYPE_RDV = {
    CONSULTATION: 'consultation',
    SUIVI: 'suivi',
    URGENCE: 'urgence',
    CONTROLE: 'controle',
} as const;

export const GROUPE_SANGUIN = {
    A_PLUS: 'A+',
    A_MOINS: 'A-',
    B_PLUS: 'B+',
    B_MOINS: 'B-',
    AB_PLUS: 'AB+',
    AB_MOINS: 'AB-',
    O_PLUS: 'O+',
    O_MOINS: 'O-',
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;