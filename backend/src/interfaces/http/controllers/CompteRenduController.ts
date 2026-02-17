import { Request, Response } from 'express';
import { CreateCompteRendu } from '../../../application/use-cases/compte-rendu/CreateCompteRendu';
import { GetComptesRendusByPatient } from '../../../application/use-cases/compte-rendu/GetComptesRendusByPatient';
import { GetCompteRenduByAdmission } from '../../../application/use-cases/compte-rendu/GetCompteRenduByAdmission';
import { ICompteRenduRepository } from '../../../domain/repositories/ICompteRenduRepository';
import { createCompteRenduSchema, updateCompteRenduSchema } from '../validators/compte-rendu.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';

export class CompteRenduController {
  constructor(private compteRenduRepository: ICompteRenduRepository) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createCompteRenduSchema.parse(req.body);

      const createCompteRendu = new CreateCompteRendu(this.compteRenduRepository);
      const compteRendu = await createCompteRendu.execute({
        ...validatedData,
        date_admission: new Date(validatedData.date_admission),
        date_sortie: new Date(validatedData.date_sortie),
      } as any);

      res.status(201).json({
        success: true,
        message: 'Compte rendu créé avec succès',
        data: compteRendu,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.issues, // Correction TS2339: utilisation de issues
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

      console.error('Erreur création compte rendu:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur serveur',
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

      const getComptesRendus = new GetComptesRendusByPatient(this.compteRenduRepository);
      const comptesRendus = await getComptesRendus.execute(patientId);

      res.status(200).json({
        success: true,
        data: comptesRendus,
        count: comptesRendus.length,
      });
    } catch (error) {
      console.error('Erreur récupération comptes rendus:', error);
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

      const getCompteRendu = new GetCompteRenduByAdmission(this.compteRenduRepository);
      const compteRendu = await getCompteRendu.execute(admissionId);

      if (!compteRendu) {
        res.status(404).json({
          success: false,
          message: 'Aucun compte rendu trouvé pour cette admission',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: compteRendu,
      });
    } catch (error) {
      console.error('Erreur récupération compte rendu:', error);
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
          message: 'ID compte rendu invalide',
        });
        return;
      }

      const compteRendu = await this.compteRenduRepository.findById(id);

      if (!compteRendu) {
        throw new NotFoundError('Compte rendu non trouvé');
      }

      res.status(200).json({
        success: true,
        data: compteRendu,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur récupération compte rendu:', error);
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
          message: 'ID compte rendu invalide',
        });
        return;
      }

      const existingCompteRendu = await this.compteRenduRepository.findById(id);
      if (!existingCompteRendu) {
        throw new NotFoundError('Compte rendu non trouvé');
      }

      const validatedData = updateCompteRenduSchema.parse(req.body);

      const updateData: any = { ...validatedData };
      if (validatedData.date_admission) {
        updateData.date_admission = new Date(validatedData.date_admission);
      }
      if (validatedData.date_sortie) {
        updateData.date_sortie = new Date(validatedData.date_sortie);
      }

      const compteRendu = await this.compteRenduRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Compte rendu mis à jour avec succès',
        data: compteRendu,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: error.issues, // Correction TS2339: utilisation de issues
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

      console.error('Erreur mise à jour compte rendu:', error);
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
          message: 'ID compte rendu invalide',
        });
        return;
      }

      const existingCompteRendu = await this.compteRenduRepository.findById(id);
      if (!existingCompteRendu) {
        throw new NotFoundError('Compte rendu non trouvé');
      }

      await this.compteRenduRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Compte rendu supprimé avec succès',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur suppression compte rendu:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };
}