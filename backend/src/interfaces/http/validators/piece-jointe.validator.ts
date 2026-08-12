// backend/src/interfaces/http/validators/piece-jointe.validator.ts

import { z } from 'zod';

const entiteTypeEnum = z.enum([
  'bilan_biologique',
  'soin_medical',
  'soin_infirmier',
  'traitement',
  'observation',
  'compte_rendu',
  'evolution_patient',
]);

export const createPieceJointeSchema = z.object({
  entite_type:     entiteTypeEnum,
  entite_id:        z.number().int().positive(),
  url_fichier:      z.string().min(1),
  nom_fichier:      z.string().min(1),
  type_fichier:     z.enum(['pdf', 'image', 'video']),
  taille_fichier:   z.number().int().positive(),
  ajoute_par:       z.string().optional(),
});