import { Request, Response } from 'express';
import { CreateEvolution }             from '../../../application/use-cases/evolution-patient/CreateEvolution';
import { GetEvolutionsByPatient }      from '../../../application/use-cases/evolution-patient/GetEvolutionsByPatient';
import { GetEvolutionsByObservation }  from '../../../application/use-cases/evolution-patient/GetEvolutionsByObservation';
import { UpdateEvolution }             from '../../../application/use-cases/evolution-patient/UpdateEvolution';
import { IEvolutionPatientRepository } from '../../../domain/repositories/IEvolutionPatientRepository';
import { IObservationRepository }      from '../../../domain/repositories/IObservationRepository';
import { ZodError, z }                 from 'zod';
import { AppError }                    from '../../../shared/errors/AppError';
import { NotFoundError }               from '../../../shared/errors/NotFoundError';
import { AuthRequest }                 from '../middlewares/auth.middleware';
import { notifyMedecinTraitant }       from '../../../shared/utils/notificationHelpers';

// Validator Zod
const createEvolutionSchema = z.object({
  id_observation:  z.number().int().positive(),
  id_patient:      z.number().int().positive(),
  date_visite:     z.string().min(1),
  heure_visite:    z.string().min(1),
  medecin:         z.string().optional(),
  resume_patient:  z.string().optional(),
  parametres:                      z.record(z.string(), z.unknown()).optional(),
  examen_physique_central:         z.record(z.string(), z.unknown()).optional(),
  examen_physique_peripherique:    z.record(z.string(), z.unknown()).optional(),
  resultats_examens_paracliniques: z.string().optional(),
  traitement:      z.string().optional(),
  problemes_poses: z.string().optional(),
  cat:             z.string().optional(),
  
});

const updateEvolutionSchema = createEvolutionSchema.partial().omit({
  id_observation: true,
  id_patient: true,
});

export class EvolutionPatientController {
  constructor(
    private evolutionRepository: IEvolutionPatientRepository,
    private observationRepository: IObservationRepository,
  ) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const data = createEvolutionSchema.parse(req.body);

      // medecin et cree_par_id derives de l'utilisateur authentifie, jamais du body
      const medecin = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`.trim();

      const createEvolution = new CreateEvolution(
        this.evolutionRepository,
        this.observationRepository,
      );
      const evolution = await createEvolution.execute({
        ...data,
        medecin,
        cree_par_id: req.user?.id_user,
        parametres:                   data.parametres                   as never,
        examen_physique_central:      data.examen_physique_central      as never,
        examen_physique_peripherique: data.examen_physique_peripherique as never,
      });

      const role = req.user?.role ?? '';
      notifyMedecinTraitant(data.id_patient, role, {
        titre:   'Nouvelle mise à jour — Fiche évolution',
        message: `Dr. ${medecin} a ajouté une mise à jour pour le patient #${data.id_patient}`,
        type: 'info', priorite: 'normale',
        lien: `/doctor/patients/${data.id_patient}/dossier`,
      }).catch(console.error);

      res.status(201).json({ success: true, message: 'Évolution créée avec succès', data: evolution });
    } catch (error) {
      if (error instanceof ZodError)  { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof AppError)  { res.status(error.statusCode).json({ success: false, message: error.message }); return; }
      if (error instanceof Error)     { res.status(400).json({ success: false, message: error.message }); return; }
      console.error('Erreur création évolution:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientId = parseInt(String(req.params.patientId), 10);
      if (isNaN(patientId)) { res.status(400).json({ success: false, message: 'ID patient invalide' }); return; }
      const evolutions = await new GetEvolutionsByPatient(this.evolutionRepository).execute(patientId);
      res.status(200).json({ success: true, data: evolutions, count: evolutions.length });
    } catch (error) {
      console.error('Erreur récupération évolutions:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByObservationId = async (req: Request, res: Response): Promise<void> => {
    try {
      const observationId = parseInt(String(req.params.observationId), 10);
      if (isNaN(observationId)) { res.status(400).json({ success: false, message: 'ID observation invalide' }); return; }
      const evolutions = await new GetEvolutionsByObservation(this.evolutionRepository).execute(observationId);
      res.status(200).json({ success: true, data: evolutions, count: evolutions.length });
    } catch (error) {
      console.error('Erreur récupération évolutions par observation:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide' }); return; }
      const evolution = await this.evolutionRepository.findById(id);
      if (!evolution) throw new NotFoundError('Évolution non trouvée');
      res.status(200).json({ success: true, data: evolution });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur récupération évolution:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide' }); return; }
      const data = updateEvolutionSchema.parse(req.body);
      const updateData = {
        ...data,
        modifie_par_id: req.user?.id_user,
      };
      const evolution = await new UpdateEvolution(this.evolutionRepository).execute(id, updateData as never);
      res.status(200).json({ success: true, message: 'Évolution mise à jour avec succès', data: evolution });
    } catch (error) {
      if (error instanceof ZodError)      { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur mise à jour évolution:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID invalide' }); return; }
      const existing = await this.evolutionRepository.findById(id);
      if (!existing) throw new NotFoundError('Évolution non trouvée');
      await this.evolutionRepository.delete(id);
      res.status(200).json({ success: true, message: 'Évolution supprimée avec succès' });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur suppression évolution:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
}