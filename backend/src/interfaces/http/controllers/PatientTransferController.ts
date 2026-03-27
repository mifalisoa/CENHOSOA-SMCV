// backend/src/interfaces/http/controllers/PatientTransferController.ts

import { Response, NextFunction } from 'express';
import { PatientTransferService } from '../../../application/services/PatientTransferService';
import { LitTransferService }     from '../../../application/services/LitTransferService';
import { AuthRequest }            from '../middlewares/auth.middleware';
import { pool }                   from '../../../config/database';

const transferService = new PatientTransferService(pool);
const litService      = new LitTransferService(pool);

export class PatientTransferController {

  async hospitaliser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const idMedecin = req.user?.id_user;
      if (!idMedecin) {
        res.status(401).json({ success: false, message: 'Non authentifié' });
        return;
      }

      // LEÇON : req.params.id est typé 'string | string[]' par Express.
      // String() garantit qu'on obtient toujours une string simple.
      const idPatient = parseInt(String(req.params.id));

      const patient = await transferService.hospitaliserPatient({
        id_patient:              idPatient,
        motif_hospitalisation:   req.body.motif_hospitalisation,
        service_hospitalisation: req.body.service_hospitalisation,
        id_lit:                  req.body.id_lit,
        date_admission:          req.body.date_admission,
        type_admission:          req.body.type_admission,
        // LEÇON : On utilise la clé 'id_medecin' avec la valeur 'idMedecin'.
        // { id_medecin: idMedecin } est explicite et évite la confusion
        // avec le shorthand { idMedecin } qui créerait une clé 'idMedecin'.
        id_medecin: idMedecin,
      });

      res.json({
        success: true,
        message: 'Patient hospitalisé avec succès',
        data:    patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async rendreExterne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await transferService.rendrePatientExterne({
        id_admission: parseInt(String(req.body.id_admission)),
        motif_sortie: req.body.motif_sortie,
        date_sortie:  req.body.date_sortie,
      });

      res.json({
        success: true,
        message: 'Patient rendu externe avec succès',
        data:    patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async transfererLit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const idPatient = parseInt(String(req.params.id));

      await litService.transfererPatient({
        id_patient:      idPatient,
        ancien_lit:      parseInt(String(req.body.ancien_lit)),
        nouveau_lit:     parseInt(String(req.body.nouveau_lit)),
        motif_transfert: req.body.motif_transfert,
        date_transfert:  req.body.date_transfert,
      });

      res.json({ success: true, message: 'Transfert de lit effectué avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async getAdmissionActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const idPatient = parseInt(String(req.params.id));
      const admission = await transferService.getAdmissionActive(idPatient);
      res.json({ success: true, data: admission });
    } catch (error) {
      next(error);
    }
  }
}