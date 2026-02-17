import { Request, Response } from 'express';
import { CreateObservation } from '../../../application/use-cases/observation/CreateObservation';
import { GetObservationsByPatient } from '../../../application/use-cases/observation/GetObservationsByPatient';
import { GetObservationsByAdmission } from '../../../application/use-cases/observation/GetObservationsByAdmission';
import { IObservationRepository } from '../../../domain/repositories/IObservationRepository';
import { createObservationSchema, updateObservationSchema } from '../validators/observation.validator';
import { ZodError } from 'zod';
import { AppError } from '../../../shared/errors/AppError';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class ObservationController {
  constructor(private observationRepository: IObservationRepository) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createObservationSchema.parse(req.body);

      // On extrait les dates de manière sécurisée pour TypeScript (Cast en 'any' car c'est une union Zod)
      const data = validatedData as any;

      const createObservation = new CreateObservation(this.observationRepository);
      const observation = await createObservation.execute({
        ...data,
        date_observation: new Date(data.date_observation),
        date_entree: data.date_entree ? new Date(data.date_entree) : undefined,
        date_transeat: data.date_transeat ? new Date(data.date_transeat) : undefined,
        date_sortie: data.date_sortie ? new Date(data.date_sortie) : undefined,
      });

      res.status(201).json({
        success: true,
        message: 'Observation créée avec succès',
        data: observation,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.issues, // Correction TS2339
        });
        return;
      }

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur création observation:', error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la création de l'observation",
      });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId as string, 10); // Correction TS2345
      const type = req.query.type as 'externe' | 'hospitalise' | undefined;

      if (isNaN(patientId)) {
        res.status(400).json({
          success: false,
          message: 'ID patient invalide',
        });
        return;
      }

      if (type && !['externe', 'hospitalise'].includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Type d\'observation invalide. Utilisez "externe" ou "hospitalise"',
        });
        return;
      }

      const getObservationsByPatient = new GetObservationsByPatient(this.observationRepository);
      const observations = await getObservationsByPatient.execute(patientId, type);

      res.status(200).json({
        success: true,
        data: observations,
        count: observations.length,
      });
    } catch (error) {
      console.error('Erreur récupération observations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des observations',
      });
    }
  };

  getByAdmissionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const admissionId = parseInt(req.params.admissionId as string, 10); // Correction TS2345

      if (isNaN(admissionId)) {
        res.status(400).json({
          success: false,
          message: 'ID admission invalide',
        });
        return;
      }

      const getObservationsByAdmission = new GetObservationsByAdmission(this.observationRepository);
      const observations = await getObservationsByAdmission.execute(admissionId);

      res.status(200).json({
        success: true,
        data: observations,
        count: observations.length,
      });
    } catch (error) {
      console.error('Erreur récupération observations par admission:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10); // Correction TS2345

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID observation invalide',
        });
        return;
      }

      const observation = await this.observationRepository.findById(id);

      if (!observation) {
        throw new NotFoundError('Observation non trouvée');
      }

      res.status(200).json({
        success: true,
        data: observation,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur récupération observation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10); // Correction TS2345

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID observation invalide',
        });
        return;
      }

      const existingObservation = await this.observationRepository.findById(id);
      if (!existingObservation) {
        throw new NotFoundError('Observation non trouvée');
      }

      const validatedData = updateObservationSchema.parse(req.body);

      const updateData: any = { ...validatedData };
      if (updateData.date_observation) updateData.date_observation = new Date(updateData.date_observation);
      if (updateData.date_entree) updateData.date_entree = new Date(updateData.date_entree);
      if (updateData.date_transeat) updateData.date_transeat = new Date(updateData.date_transeat);
      if (updateData.date_sortie) updateData.date_sortie = new Date(updateData.date_sortie);

      const observation = await this.observationRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Observation mise à jour avec succès',
        data: observation,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.issues, // Correction TS2339
        });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur mise à jour observation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10); // Correction TS2345

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID observation invalide',
        });
        return;
      }

      const existingObservation = await this.observationRepository.findById(id);
      if (!existingObservation) {
        throw new NotFoundError('Observation non trouvée');
      }

      await this.observationRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Observation supprimée avec succès',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur suppression observation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };
}