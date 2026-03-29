// backend/src/interfaces/http/controllers/RendezVousController.ts

import { Request, Response }            from 'express';
import { RendezVousService }            from '../../../application/services/RendezVousService';
import { PostgresRendezVousRepository } from '../../../infrastructure/database/postgres/repositories/PostgresRendezVousRepository';
import { pool }                         from '../../../config/database';
import { notificationService }          from '../../../application/services/NotificationService';
import { AuthRequest }                  from '../middlewares/auth.middleware';

export class RendezVousController {
  private rendezVousService: RendezVousService;

  constructor() {
    const repository = new PostgresRendezVousRepository(pool);
    this.rendezVousService = new RendezVousService(repository);
  }

  async getAll(req: Request, res: Response) {
    try {
      const { date, date_debut, date_fin, patient_id, docteur_id } = req.query;
      let rendezVous;

      if (date) {
        rendezVous = await this.rendezVousService.getRendezVousByDate(date as string);
      } else if (date_debut && date_fin) {
        rendezVous = await this.rendezVousService.getRendezVousByPeriod(
          date_debut as string, date_fin as string
        );
      } else if (patient_id) {
        rendezVous = await this.rendezVousService.getRendezVousByPatient(
          parseInt(patient_id as string)
        );
      } else if (docteur_id) {
        rendezVous = await this.rendezVousService.getRendezVousByDocteur(
          parseInt(docteur_id as string)
        );
      } else {
        rendezVous = await this.rendezVousService.getAllRendezVous();
      }

      res.json({ success: true, data: rendezVous });
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id         = parseInt(req.params.id as string);
      const rendezVous = await this.rendezVousService.getRendezVousById(id);
      if (!rendezVous) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
      res.json({ success: true, data: rendezVous });
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const rdv    = await this.rendezVousService.createRendezVous(req.body);
      const auteur = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;

      // ✅ Notifier admins ET secrétaires
      notificationService.notifyAdminsAndSecretaires({
        titre:    'Nouveau rendez-vous planifié',
        message:  `RDV planifié le ${rdv.date_rdv} à ${rdv.heure_rdv} — créé par ${auteur}`,
        type:     'rdv',
        priorite: 'normale',
        lien:     '/planning',
      }).catch(console.error);

      // Notifier le docteur si ce n'est pas lui qui a créé le RDV
      if (rdv.id_docteur && rdv.id_docteur !== req.user?.id_user) {
        notificationService.notifyUser(rdv.id_docteur, {
          titre:    'Nouveau rendez-vous',
          message:  `Un RDV vous a été assigné le ${rdv.date_rdv} à ${rdv.heure_rdv} — créé par ${auteur}`,
          type:     'rdv',
          priorite: 'normale',
          lien:     '/doctor/planning',
        }).catch(console.error);
      }

      res.status(201).json({ success: true, data: rdv, message: 'Rendez-vous créé avec succès' });
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id         = parseInt(req.params.id as string);
      const rendezVous = await this.rendezVousService.updateRendezVous(id, req.body);
      if (!rendezVous) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
      res.json({ success: true, data: rendezVous, message: 'Rendez-vous mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur mise à jour rendez-vous:', error);
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id      = parseInt(req.params.id as string);
      const deleted = await this.rendezVousService.deleteRendezVous(id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
      res.json({ success: true, message: 'Rendez-vous supprimé avec succès' });
    } catch (error) {
      console.error('Erreur suppression rendez-vous:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async confirmer(req: AuthRequest, res: Response) {
    try {
      const id     = parseInt(req.params.id as string);
      const rdv    = await this.rendezVousService.getRendezVousById(id);
      if (!rdv) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });

      const confirmed = await this.rendezVousService.confirmerRendezVous(id);
      if (!confirmed) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });

      const auteur = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;

      // ✅ Notifier admins ET secrétaires
      notificationService.notifyAdminsAndSecretaires({
        titre:    'Rendez-vous confirmé',
        message:  `RDV du ${rdv.date_rdv} à ${rdv.heure_rdv} confirmé par ${auteur}`,
        type:     'rdv',
        priorite: 'normale',
        lien:     '/planning',
      }).catch(console.error);

      res.json({ success: true, data: rdv, message: 'Rendez-vous confirmé' });
    } catch (error) {
      console.error('Erreur confirmation rendez-vous:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async annuler(req: AuthRequest, res: Response) {
    try {
      const id      = parseInt(req.params.id as string);
      const { raison } = req.body;

      const rdv = await this.rendezVousService.getRendezVousById(id);
      if (!rdv) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });

      const cancelled = await this.rendezVousService.annulerRendezVous(id, raison);
      if (!cancelled) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });

      const auteur    = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;
      const raisonMsg = raison ? ` — Raison : ${raison}` : '';

      // ✅ Notifier admins ET secrétaires
      notificationService.notifyAdminsAndSecretaires({
        titre:    'Rendez-vous annulé',
        message:  `RDV du ${rdv.date_rdv} à ${rdv.heure_rdv} annulé par ${auteur}${raisonMsg}`,
        type:     'rdv',
        priorite: 'haute',
        lien:     '/planning',
      }).catch(console.error);

      // Notifier le docteur si ce n'est pas lui qui a annulé
      if (rdv.id_docteur && rdv.id_docteur !== req.user?.id_user) {
        notificationService.notifyUser(rdv.id_docteur, {
          titre:    'Rendez-vous annulé',
          message:  `Votre RDV du ${rdv.date_rdv} à ${rdv.heure_rdv} a été annulé par ${auteur}${raisonMsg}`,
          type:     'rdv',
          priorite: 'haute',
          lien:     '/doctor/planning',
        }).catch(console.error);
      }

      res.json({ success: true, data: rdv, message: 'Rendez-vous annulé' });
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async marquerTermine(req: Request, res: Response) {
    try {
      const id     = parseInt(req.params.id as string);
      const result = await this.rendezVousService.marquerTermine(id);
      if (!result) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
      res.json({ success: true, message: 'Rendez-vous marqué comme terminé' });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async marquerAbsent(req: Request, res: Response) {
    try {
      const id     = parseInt(req.params.id as string);
      const result = await this.rendezVousService.marquerAbsent(id);
      if (!result) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
      res.json({ success: true, message: 'Rendez-vous marqué comme absent' });
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async reporter(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { nouvelle_date, nouvelle_heure } = req.body;

      if (!nouvelle_date || !nouvelle_heure) {
        return res.status(400).json({ success: false, message: 'Date et heure requises' });
      }

      const rdvAvant = await this.rendezVousService.getRendezVousById(id);
      if (!rdvAvant) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });

      const rdv = await this.rendezVousService.reporterRendezVous(id, nouvelle_date, nouvelle_heure);
      if (!rdv) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });

      const auteur = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;

      // ✅ Notifier admins ET secrétaires
      notificationService.notifyAdminsAndSecretaires({
        titre:    'Rendez-vous reporté',
        message:  `RDV reporté au ${nouvelle_date} à ${nouvelle_heure} par ${auteur}`,
        type:     'rdv',
        priorite: 'normale',
        lien:     '/planning',
      }).catch(console.error);

      // Notifier le docteur si ce n'est pas lui qui a reporté
      if (rdvAvant.id_docteur && rdvAvant.id_docteur !== req.user?.id_user) {
        notificationService.notifyUser(rdvAvant.id_docteur, {
          titre:    'Rendez-vous reporté',
          message:  `Votre RDV a été reporté au ${nouvelle_date} à ${nouvelle_heure} par ${auteur}`,
          type:     'rdv',
          priorite: 'normale',
          lien:     '/doctor/planning',
        }).catch(console.error);
      }

      res.json({ success: true, data: rdv, message: 'Rendez-vous reporté' });
    } catch (error) {
      console.error('Erreur report rendez-vous:', error);
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }

  async getCreneauxDisponibles(req: Request, res: Response) {
    try {
      const { docteur_id, date, heure_debut, heure_fin, duree_creneau } = req.query;

      if (!docteur_id || !date) {
        return res.status(400).json({ success: false, message: 'ID docteur et date requis' });
      }

      const creneaux = await this.rendezVousService.getCreneauxDisponibles(
        parseInt(docteur_id as string),
        date as string,
        (heure_debut as string) || '08:00',
        (heure_fin   as string) || '18:00',
        parseInt((duree_creneau as string) || '30')
      );

      res.json({ success: true, data: creneaux });
    } catch (error) {
      console.error('Erreur récupération créneaux:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  }
}