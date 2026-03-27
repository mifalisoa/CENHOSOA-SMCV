// backend/src/interfaces/http/controllers/PatientController.ts

import { Response, NextFunction } from 'express';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { pool } from '../../../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PatientFilters } from '../../../domain/entities/Patient';

const patientRepository = new PostgresPatientRepository(pool);

export class PatientController {

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters: PatientFilters = {
        statut:    req.query.statut    as PatientFilters['statut'],
        assurance: req.query.assurance as string | undefined,
        search:    req.query.search    as string | undefined,
      };

      if (req.user?.role === 'medecin') {
        filters.id_medecin_traitant = req.user.id_user;
      }

      const result = await patientRepository.findAll({ page, limit }, filters);
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id      = parseInt(req.params.id as string);
      const patient = await patientRepository.findById(id);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      res.json({ success: true, data: patient });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = { ...req.body };

      // Médecin → associer automatiquement son id
      if (req.user?.role === 'medecin') {
        data.id_medecin_traitant = req.user.id_user;
      }

      const patient = await patientRepository.create(data);
      res.status(201).json({ success: true, message: 'Patient créé avec succès', data: patient });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id      = parseInt(req.params.id as string);
      const patient = await patientRepository.update(id, req.body);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      res.json({ success: true, message: 'Patient mis à jour avec succès', data: patient });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      await patientRepository.delete(id);
      res.json({ success: true, message: 'Patient supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async getExternes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (req.user?.role === 'medecin') {
        const result = await patientRepository.findAll(
          { page, limit },
          { statut: 'externe', id_medecin_traitant: req.user.id_user }
        );
        return res.json({ success: true, data: result.data, pagination: result.pagination });
      }

      const result = await patientRepository.findByStatus('externe', { page, limit });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getHospitalises(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (req.user?.role === 'medecin') {
        const result = await patientRepository.findAll(
          { page, limit },
          { statut: 'hospitalise', id_medecin_traitant: req.user.id_user }
        );
        return res.json({ success: true, data: result.data, pagination: result.pagination });
      }

      const result = await patientRepository.findByStatus('hospitalise', { page, limit });
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query) return res.status(400).json({ success: false, message: 'Paramètre de recherche requis' });

      let patients = await patientRepository.search(query);

      if (req.user?.role === 'medecin') {
        patients = patients.filter(p => p.id_medecin_traitant === req.user!.id_user);
      }

      res.json({ success: true, data: patients });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await patientRepository.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}