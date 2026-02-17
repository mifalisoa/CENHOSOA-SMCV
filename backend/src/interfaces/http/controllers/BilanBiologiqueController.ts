import { Request, Response } from 'express';
import { CreateBilanBiologique } from '../../../application/use-cases/bilan-biologique/CreateBilanBiologique';
import { GetBilansByPatient } from '../../../application/use-cases/bilan-biologique/GetBilansByPatient';
import { GetBilansByAdmission } from '../../../application/use-cases/bilan-biologique/GetBilansByAdmission';
import { IBilanBiologiqueRepository } from '../../../domain/repositories/IBilanBiologiqueRepository';
import { createBilanBiologiqueSchema, updateBilanBiologiqueSchema } from '../validators/bilan-biologique.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';

export class BilanBiologiqueController {
  constructor(private bilanRepository: IBilanBiologiqueRepository) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createBilanBiologiqueSchema.parse(req.body);

      const createBilan = new CreateBilanBiologique(this.bilanRepository);
      const bilan = await createBilan.execute({
        ...validatedData,
        date_prelevement: new Date(validatedData.date_prelevement),
      });

      res.status(201).json({
        success: true,
        message: 'Bilan biologique créé avec succès',
        data: bilan,
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

      console.error('Erreur création bilan:', error);
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

      const getBilans = new GetBilansByPatient(this.bilanRepository);
      const bilans = await getBilans.execute(patientId);

      res.status(200).json({
        success: true,
        data: bilans,
        count: bilans.length,
      });
    } catch (error) {
      console.error('Erreur récupération bilans:', error);
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

      const getBilans = new GetBilansByAdmission(this.bilanRepository);
      const bilans = await getBilans.execute(admissionId);

      res.status(200).json({
        success: true,
        data: bilans,
        count: bilans.length,
      });
    } catch (error) {
      console.error('Erreur récupération bilans:', error);
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
          message: 'ID bilan invalide',
        });
        return;
      }

      const bilan = await this.bilanRepository.findById(id);

      if (!bilan) {
        throw new NotFoundError('Bilan biologique non trouvé');
      }

      res.status(200).json({
        success: true,
        data: bilan,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur récupération bilan:', error);
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
          message: 'ID bilan invalide',
        });
        return;
      }

      const existingBilan = await this.bilanRepository.findById(id);
      if (!existingBilan) {
        throw new NotFoundError('Bilan biologique non trouvé');
      }

      const validatedData = updateBilanBiologiqueSchema.parse(req.body);

      const updateData: any = { ...validatedData };
      if (validatedData.date_prelevement) {
        updateData.date_prelevement = new Date(validatedData.date_prelevement);
      }

      const bilan = await this.bilanRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Bilan biologique mis à jour avec succès',
        data: bilan,
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

      console.error('Erreur mise à jour bilan:', error);
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
          message: 'ID bilan invalide',
        });
        return;
      }

      const existingBilan = await this.bilanRepository.findById(id);
      if (!existingBilan) {
        throw new NotFoundError('Bilan biologique non trouvé');
      }

      await this.bilanRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Bilan biologique supprimé avec succès',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur suppression bilan:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };
}