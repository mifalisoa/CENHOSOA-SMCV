import { z } from 'zod';

export const createDocumentPatientSchema = z.object({
  id_patient: z.number().int().positive(),
  id_admission: z.number().int().positive().optional(),
  
  titre: z.string().min(1, "Le titre est requis"),
  type_fichier: z.enum(['pdf', 'image', 'video']),
  nom_fichier: z.string().min(1, "Le nom du fichier est requis"),
  url_fichier: z.string().url("URL de fichier invalide"),
  taille_fichier: z.number().int().positive(),
  description: z.string().optional(),
  
  date_ajout: z.string().datetime().or(z.date()),
  heure_ajout: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ajoute_par: z.string().optional(),
});

export const updateDocumentPatientSchema = createDocumentPatientSchema
  .partial()
  .omit({ id_patient: true });