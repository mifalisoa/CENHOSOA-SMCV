import { Request, Response } from 'express';
import { CreateSoinInfirmier } from '../../../application/use-cases/soin-infirmier/CreateSoinInfirmier';
import { GetSoinsInfirmiersByPatient } from '../../../application/use-cases/soin-infirmier/GetSoinsInfirmiersByPatient';
import { GetSoinsInfirmiersByAdmission } from '../../../application/use-cases/soin-infirmier/GetSoinsInfirmiersByAdmission';
import { VerifySoinInfirmier } from '../../../application/use-cases/soin-infirmier/VerifySoinInfirmier';
import { ISoinInfirmierRepository } from '../../../domain/repositories/ISoinInfirmierRepository';
import { createSoinInfirmierSchema, updateSoinInfirmierSchema } from '../validators/soin-infirmier.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';

export class SoinInfirmierController {
  constructor(private soinRepository: ISoinInfirmierRepository) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createSoinInfirmierSchema.parse(req.body);

      const createSoin = new CreateSoinInfirmier(this.soinRepository);
      const soin = await createSoin.execute({
        ...validatedData,
        date_soin: new Date(validatedData.date_soin),
      });

      res.status(201).json({
        success: true,
        message: 'Soin infirmier créé avec succès',
        data: soin,
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

      console.error('Erreur création soin infirmier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast en string pour parseInt
      const patientId = parseInt(req.params.patientId as string, 10);

      if (isNaN(patientId)) {
        res.status(400).json({
          success: false,
          message: 'ID patient invalide',
        });
        return;
      }

      const getSoins = new GetSoinsInfirmiersByPatient(this.soinRepository);
      const soins = await getSoins.execute(patientId);

      res.status(200).json({
        success: true,
        data: soins,
        count: soins.length,
      });
    } catch (error) {
      console.error('Erreur récupération soins infirmiers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  getByAdmissionId = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast en string pour parseInt
      const admissionId = parseInt(req.params.admissionId as string, 10);

      if (isNaN(admissionId)) {
        res.status(400).json({
          success: false,
          message: 'ID admission invalide',
        });
        return;
      }

      const getSoins = new GetSoinsInfirmiersByAdmission(this.soinRepository);
      const soins = await getSoins.execute(admissionId);

      res.status(200).json({
        success: true,
        data: soins,
        count: soins.length,
      });
    } catch (error) {
      console.error('Erreur récupération soins infirmiers:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast en string pour parseInt
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID soin invalide',
        });
        return;
      }

      const soin = await this.soinRepository.findById(id);

      if (!soin) {
        throw new NotFoundError('Soin infirmier non trouvé');
      }

      res.status(200).json({
        success: true,
        data: soin,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur récupération soin infirmier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast en string pour parseInt
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID soin invalide',
        });
        return;
      }

      const existingSoin = await this.soinRepository.findById(id);
      if (!existingSoin) {
        throw new NotFoundError('Soin infirmier non trouvé');
      }

      const validatedData = updateSoinInfirmierSchema.parse(req.body);

      const updateData: any = { ...validatedData };
      if (validatedData.date_soin) {
        updateData.date_soin = new Date(validatedData.date_soin);
      }

      const soin = await this.soinRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Soin infirmier mis à jour avec succès',
        data: soin,
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

      console.error('Erreur mise à jour soin infirmier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast en string pour parseInt
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID soin invalide',
        });
        return;
      }

      const verifySoin = new VerifySoinInfirmier(this.soinRepository);
      const soin = await verifySoin.execute(id);

      res.status(200).json({
        success: true,
        message: `Soin infirmier ${soin.verifie ? 'vérifié' : 'non vérifié'}`,
        data: soin,
      });
    } catch (error) {
      console.error('Erreur vérification soin infirmier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      // Correction TS2345: cast en string pour parseInt
      const id = parseInt(req.params.id as string, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID soin invalide',
        });
        return;
      }

      const existingSoin = await this.soinRepository.findById(id);
      if (!existingSoin) {
        throw new NotFoundError('Soin infirmier non trouvé');
      }

      await this.soinRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Soin infirmier supprimé avec succès',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur suppression soin infirmier:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };
}