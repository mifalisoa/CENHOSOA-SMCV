import { Request, Response } from 'express';
import { CreateDocumentPatient } from '../../../application/use-cases/document-patient/CreateDocumentPatient';
import { GetDocumentsByPatient } from '../../../application/use-cases/document-patient/GetDocumentsByPatient';
import { GetDocumentsByAdmission } from '../../../application/use-cases/document-patient/GetDocumentsByAdmission';
import { IDocumentPatientRepository } from '../../../domain/repositories/IDocumentPatientRepository';
import { createDocumentPatientSchema, updateDocumentPatientSchema } from '../validators/document-patient.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';

export class DocumentPatientController {
  constructor(private documentRepository: IDocumentPatientRepository) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createDocumentPatientSchema.parse(req.body);

      const createDocument = new CreateDocumentPatient(this.documentRepository);
      const document = await createDocument.execute({
        ...validatedData,
        date_ajout: new Date(validatedData.date_ajout),
      });

      res.status(201).json({
        success: true,
        message: 'Document créé avec succès',
        data: document,
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

      console.error('Erreur création document:', error);
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

      const getDocuments = new GetDocumentsByPatient(this.documentRepository);
      const documents = await getDocuments.execute(patientId);

      res.status(200).json({
        success: true,
        data: documents,
        count: documents.length,
      });
    } catch (error) {
      console.error('Erreur récupération documents:', error);
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

      const getDocuments = new GetDocumentsByAdmission(this.documentRepository);
      const documents = await getDocuments.execute(admissionId);

      res.status(200).json({
        success: true,
        data: documents,
        count: documents.length,
      });
    } catch (error) {
      console.error('Erreur récupération documents:', error);
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
          message: 'ID document invalide',
        });
        return;
      }

      const document = await this.documentRepository.findById(id);

      if (!document) {
        throw new NotFoundError('Document non trouvé');
      }

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur récupération document:', error);
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
          message: 'ID document invalide',
        });
        return;
      }

      const existingDocument = await this.documentRepository.findById(id);
      if (!existingDocument) {
        throw new NotFoundError('Document non trouvé');
      }

      const validatedData = updateDocumentPatientSchema.parse(req.body);

      const updateData: any = { ...validatedData };
      if (validatedData.date_ajout) {
        updateData.date_ajout = new Date(validatedData.date_ajout);
      }

      const document = await this.documentRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Document mis à jour avec succès',
        data: document,
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

      console.error('Erreur mise à jour document:', error);
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
          message: 'ID document invalide',
        });
        return;
      }

      const existingDocument = await this.documentRepository.findById(id);
      if (!existingDocument) {
        throw new NotFoundError('Document non trouvé');
      }

      await this.documentRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Document supprimé avec succès',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Erreur suppression document:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur',
      });
    }
  };
}