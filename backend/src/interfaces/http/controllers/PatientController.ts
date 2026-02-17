import { Request, Response, NextFunction } from 'express';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { pool } from '../../../config/database';

const patientRepository = new PostgresPatientRepository(pool);

export class PatientController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters = {
        statut: req.query.statut as 'externe' | 'hospitalise' | undefined,
        groupe_sanguin: req.query.groupe_sanguin as string | undefined,
        assurance: req.query.assurance as string | undefined,
        search: req.query.search as string | undefined,
      };
      
      const result = await patientRepository.findAll({ page, limit }, filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const patient = await patientRepository.findById(id);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé',
        });
      }
      
      res.json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('📨 [Controller] Requête de création patient:', req.body);
      const patient = await patientRepository.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Patient créé avec succès',
        data: patient,
      });
    } catch (error) {
      console.error('❌ [Controller] Erreur création patient:', error);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const patient = await patientRepository.update(id, req.body);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient non trouvé',
        });
      }
      
      res.json({
        success: true,
        message: 'Patient mis à jour avec succès',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await patientRepository.delete(id);
      
      res.json({
        success: true,
        message: 'Patient supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }

  async getExternes(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await patientRepository.findByStatus('externe', { page, limit });
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHospitalises(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await patientRepository.findByStatus('hospitalise', { page, limit });
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Paramètre de recherche requis',
        });
      }
      
      const patients = await patientRepository.search(query);
      
      res.json({
        success: true,
        data: patients,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await patientRepository.getStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}