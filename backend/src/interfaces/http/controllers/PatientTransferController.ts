// backend/src/interfaces/http/controllers/PatientTransferController.ts

import { Request, Response, NextFunction } from 'express';
import { PatientTransferService } from '../../../application/services/PatientTransferService';
import { pool } from '../../../config/database';

const transferService = new PatientTransferService(pool);

export class PatientTransferController {
  /**
   * POST /api/patients/:id/hospitaliser
   */
  async hospitaliser(req: Request, res: Response, next: NextFunction) {
    try {
      // Correction ici : ajout de "as string"
      const patientId = parseInt(req.params.id as string);
      const { motif_hospitalisation, service_hospitalisation, id_lit } = req.body;

      if (!motif_hospitalisation || !service_hospitalisation) {
        return res.status(400).json({
          success: false,
          message: 'Motif et service d\'hospitalisation requis'
        });
      }

      const patient = await transferService.hospitaliserPatient({
        id_patient: patientId,
        motif_hospitalisation,
        service_hospitalisation,
        id_lit: id_lit ? parseInt(id_lit) : undefined,
        date_admission: req.body.date_admission
      });

      res.status(200).json({
        success: true,
        message: 'Patient hospitalisé avec succès',
        data: patient
      });
    } catch (error: any) {
      console.error('Erreur hospitalisation:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de l\'hospitalisation'
      });
    }
  }

  /**
   * POST /api/patients/:id/rendre-externe
   */
  async rendreExterne(req: Request, res: Response, next: NextFunction) {
    try {
      // Correction ici : ajout de "as string"
      const patientId = parseInt(req.params.id as string);
      const { motif_sortie } = req.body;

      if (!motif_sortie) {
        return res.status(400).json({
          success: false,
          message: 'Motif de sortie requis'
        });
      }

      const admission = await transferService.getAdmissionActive(patientId);
      
      if (!admission) {
        return res.status(404).json({
          success: false,
          message: 'Aucune admission active trouvée pour ce patient'
        });
      }

      const patient = await transferService.rendrePatientExterne({
        id_admission: admission.id_admission,
        motif_sortie,
        date_sortie: req.body.date_sortie
      });

      res.status(200).json({
        success: true,
        message: 'Patient rendu externe avec succès',
        data: patient
      });
    } catch (error: any) {
      console.error('Erreur sortie:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la sortie'
      });
    }
  }

  /**
   * GET /api/patients/:id/admission-active
   */
  async getAdmissionActive(req: Request, res: Response, next: NextFunction) {
    try {
      // Correction ici : ajout de "as string"
      const patientId = parseInt(req.params.id as string);
      const admission = await transferService.getAdmissionActive(patientId);

      if (!admission) {
        return res.status(404).json({
          success: false,
          message: 'Aucune admission active'
        });
      }

      res.status(200).json({
        success: true,
        data: admission
      });
    } catch (error: any) {
      console.error('Erreur récupération admission:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur serveur'
      });
    }
  }
}