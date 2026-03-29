// backend/src/interfaces/http/controllers/PatientTransferController.ts

import { Response, NextFunction }    from 'express';
import { PatientTransferService }    from '../../../application/services/PatientTransferService';
import { LitTransferService }        from '../../../application/services/LitTransferService';
import { AuthRequest }               from '../middlewares/auth.middleware';
import { pool }                      from '../../../config/database';
import { notificationService }       from '../../../application/services/NotificationService';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';

const transferService   = new PatientTransferService(pool);
const litService        = new LitTransferService(pool);
const patientRepository = new PostgresPatientRepository(pool);

export class PatientTransferController {

  async hospitaliser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const idMedecin = req.user?.id_user;
      if (!idMedecin) {
        res.status(401).json({ success: false, message: 'Non authentifié' });
        return;
      }

      const idPatient = parseInt(String(req.params.id));
      const patient   = await transferService.hospitaliserPatient({
        id_patient:              idPatient,
        motif_hospitalisation:   req.body.motif_hospitalisation,
        service_hospitalisation: req.body.service_hospitalisation,
        id_lit:                  req.body.id_lit,
        date_admission:          req.body.date_admission,
        type_admission:          req.body.type_admission,
        id_medecin:              idMedecin,
      });

      // Notifier les admins
      notificationService.notifyAdmins({
        titre:    'Patient hospitalisé',
        message:  `${patient.nom_patient} ${patient.prenom_patient} a été hospitalisé par Dr. ${req.user?.nom} — ${req.body.service_hospitalisation || 'Service non précisé'}`,
        type:     'admission',
        priorite: 'haute',
        lien:     `/patients/${idPatient}/dossier`,
      }).catch(console.error);

      res.json({ success: true, message: 'Patient hospitalisé avec succès', data: patient });
    } catch (error) { next(error); }
  }

  async rendreExterne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await transferService.rendrePatientExterne({
        id_admission: parseInt(String(req.body.id_admission)),
        motif_sortie: req.body.motif_sortie,
        date_sortie:  req.body.date_sortie,
      });

      // Notifier les admins
      notificationService.notifyAdmins({
        titre:    'Patient sorti de l\'hôpital',
        message:  `${patient.nom_patient} ${patient.prenom_patient} a été rendu externe par ${req.user?.prenom} ${req.user?.nom}`,
        type:     'admission',
        priorite: 'normale',
        lien:     `/patients/${patient.id_patient}/dossier`,
      }).catch(console.error);

      res.json({ success: true, message: 'Patient rendu externe avec succès', data: patient });
    } catch (error) { next(error); }
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

      // Récupérer le patient pour le message
      const patient = await patientRepository.findById(idPatient);

      if (patient) {
        notificationService.notifyAdmins({
          titre:    'Transfert de lit',
          message:  `${patient.nom_patient} ${patient.prenom_patient} a été transféré du lit ${req.body.ancien_lit} vers le lit ${req.body.nouveau_lit}`,
          type:     'admission',
          priorite: 'normale',
          lien:     `/patients/${idPatient}/dossier`,
        }).catch(console.error);
      }

      res.json({ success: true, message: 'Transfert de lit effectué avec succès' });
    } catch (error) { next(error); }
  }

  async getAdmissionActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const idPatient = parseInt(String(req.params.id));
      const admission = await transferService.getAdmissionActive(idPatient);
      res.json({ success: true, data: admission });
    } catch (error) { next(error); }
  }
}