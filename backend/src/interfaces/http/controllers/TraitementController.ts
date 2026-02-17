import { Request, Response } from 'express';
import { CreateTraitement } from '../../../application/use-cases/traitement/CreateTraitement';
import { GetTraitementsByPatient } from '../../../application/use-cases/traitement/GetTraitementsByPatient';
import { GetTraitementsByAdmission } from '../../../application/use-cases/traitement/GetTraitementsByAdmission';
import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { createTraitementSchema, updateTraitementSchema } from '../validators/traitement.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';

export class TraitementController {
  constructor(private traitementRepository: ITraitementRepository) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createTraitementSchema.parse(req.body);

      const createTraitement = new CreateTraitement(this.traitementRepository);
      const traitement = await createTraitement.execute({
        ...validatedData,
        date_prescription: new Date(validatedData.date_prescription),
      } as any);

      res.status(201).json({
        success: true,
        message: 'Traitement créé avec succès',
        data: traitement,
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

      console.error('Erreur création traitement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast explicite en string
      const patientId = parseInt(req.params.patientId as string, 10);

      if (isNaN(patientId)) {
        res.status(400).json({
          success: false,
          message: 'ID patient invalide',
        });
        return;
      }

      const getTraitements = new GetTraitementsByPatient(this.traitementRepository);
      const traitements = await getTraitements.execute(patientId);

      res.status(200).json({
        success: true,
        data: traitements,
        count: traitements.length,
      });
    } catch (error) {
      console.error('Erreur récupération traitements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  getByAdmissionId = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast explicite en string
      const admissionId = parseInt(req.params.admissionId as string, 10);

      if (isNaN(admissionId)) {
        res.status(400).json({
          success: false,
          message: 'ID admission invalide',
        });
        return;
      }

      const getTraitements = new GetTraitementsByAdmission(this.traitementRepository);
      const traitements = await getTraitements.execute(admissionId);

      res.status(200).json({
        success: true,
        data: traitements,
        count: traitements.length,
      });
    } catch (error) {
      console.error('Erreur récupération traitements:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast explicite en string
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID traitement invalide',
        });
        return;
      }

      const traitement = await this.traitementRepository.findById(id);

      if (!traitement) {
        throw new NotFoundError('Traitement non trouvé');
      }

      res.status(200).json({
        success: true,
        data: traitement,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur récupération traitement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast explicite en string
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID traitement invalide',
        });
        return;
      }

      const existingTraitement = await this.traitementRepository.findById(id);
      if (!existingTraitement) {
        throw new NotFoundError('Traitement non trouvé');
      }

      const validatedData = updateTraitementSchema.parse(req.body);

      const updateData: any = { ...validatedData };
      if (validatedData.date_prescription) {
        updateData.date_prescription = new Date(validatedData.date_prescription);
      }

      const traitement = await this.traitementRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Traitement mis à jour avec succès',
        data: traitement,
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

      console.error('Erreur mise à jour traitement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast explicite en string
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID traitement invalide',
        });
        return;
      }

      const existingTraitement = await this.traitementRepository.findById(id);
      if (!existingTraitement) {
        throw new NotFoundError('Traitement non trouvé');
      }

      await this.traitementRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Traitement supprimé avec succès',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur suppression traitement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };
}