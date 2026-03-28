// backend/src/shared/constants/permissions.ts

export const DEFAULT_PERMISSIONS: Record<string, string[]> = {

  admin: ['*'],

  medecin: [
    'patients.read',            'patients.write',
    'admissions.read',          'admissions.write',
    'observations.write',       'prescriptions.write',
    'bilans.read',              'bilans.write',
    'rdv.read',                 'rdv.write',
    'soins-medicaux.read',      'soins-medicaux.write',
    'soins-infirmiers.read',
    'documents.read',           'documents.write',
    'documents.export',         'statistiques.read',
    'lits.read',                'compte-rendu.read',
    'compte-rendu.write',
  ],

  interne: [
    'patients.read',            'patients.write',
    'admissions.read',          'admissions.write',
    'observations.write',       'prescriptions.write',
    'bilans.read',              'bilans.write',
    'rdv.read',                 'rdv.write',
    'soins-medicaux.read',      'soins-medicaux.write',
    'soins-infirmiers.read',
    'documents.read',           'documents.write',
    'documents.export',         'lits.read',
    'compte-rendu.read',        'compte-rendu.write',
  ],

  stagiaire: [
    'patients.read',
    'admissions.read',
    'observations.read',
    'bilans.read',
    'soins-medicaux.read',
    'soins-infirmiers.read',
    'rdv.read',
    'lits.read',
    'documents.read',
    'compte-rendu.read',
  ],

  infirmier: [
    'patients.read',            'admissions.read',
    'soins-infirmiers.read',    'soins-infirmiers.write',
    'soins-medicaux.read',
    'observations.read',        'prescriptions.read',
    'rdv.read',                 'lits.read',
    'lits.write',               'bilans.read',
    'documents.read',           'compte-rendu.read',
  ],

  secretaire: [
    'patients.read',    'patients.write',
    'rdv.read',         'rdv.write',
    'rdv.cancel',       'admissions.read',
    'lits.read',        'documents.read',
    'documents.export',
  ],
};

export const ALL_PERMISSIONS = [
  'patients.read',            'patients.write',
  'admissions.read',          'admissions.write',
  'rdv.read',                 'rdv.write',          'rdv.cancel',
  'observations.read',        'observations.write',
  'prescriptions.read',       'prescriptions.write',
  'soins-medicaux.read',      'soins-medicaux.write',
  'soins-infirmiers.read',    'soins-infirmiers.write',
  'bilans.read',              'bilans.write',
  'lits.read',                'lits.write',
  'documents.read',           'documents.write',    'documents.export',
  'compte-rendu.read',        'compte-rendu.write',
  'statistiques.read',
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];