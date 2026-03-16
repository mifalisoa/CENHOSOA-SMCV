// backend/src/interfaces/http/controllers/RendezVousController.ts

import { Request, Response } from 'express';
import { RendezVousService } from '../../../application/services/RendezVousService';
import { PostgresRendezVousRepository } from '../../../infrastructure/database/postgres/repositories/PostgresRendezVousRepository';
import { pool } from '../../../config/database';

export class RendezVousController {
  private rendezVousService: RendezVousService;

  constructor() {
    const repository = new PostgresRendezVousRepository(pool);
    this.rendezVousService = new RendezVousService(repository);
  }

  /**
   * GET /rendez-vous
   * Récupérer tous les rendez-vous ou filtrer par date/période/patient/docteur
   */
  async getAll(req: Request, res: Response) {
    try {
      const { date, date_debut, date_fin, patient_id, docteur_id } = req.query;

      let rendezVous;

      if (date) {
        // Filtrer par date spécifique
        rendezVous = await this.rendezVousService.getRendezVousByDate(date as string);
      } else if (date_debut && date_fin) {
        // Filtrer par période
        rendezVous = await this.rendezVousService.getRendezVousByPeriod(
          date_debut as string,
          date_fin as string
        );
      } else if (patient_id) {
        // Filtrer par patient
        rendezVous = await this.rendezVousService.getRendezVousByPatient(
          parseInt(patient_id as string)
        );
      } else if (docteur_id) {
        // Filtrer par docteur
        rendezVous = await this.rendezVousService.getRendezVousByDocteur(
          parseInt(docteur_id as string)
        );
      } else {
        // Tous les rendez-vous
        rendezVous = await this.rendezVousService.getAllRendezVous();
      }

      res.json({
        success: true,
        data: rendezVous
      });
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * GET /rendez-vous/:id
   * Récupérer un rendez-vous par ID
   */
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const rendezVous = await this.rendezVousService.getRendezVousById(id);

      if (!rendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        data: rendezVous
      });
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * POST /rendez-vous
   * Créer un nouveau rendez-vous
   */
  async create(req: Request, res: Response) {
    try {
      const rendezVous = await this.rendezVousService.createRendezVous(req.body);

      res.status(201).json({
        success: true,
        data: rendezVous,
        message: 'Rendez-vous créé avec succès'
      });
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * PUT /rendez-vous/:id
   * Mettre à jour un rendez-vous
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const rendezVous = await this.rendezVousService.updateRendezVous(id, req.body);

      if (!rendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        data: rendezVous,
        message: 'Rendez-vous mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur mise à jour rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * DELETE /rendez-vous/:id
   * Supprimer un rendez-vous
   */
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const deleted = await this.rendezVousService.deleteRendezVous(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Rendez-vous supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur suppression rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * PATCH /rendez-vous/:id/confirmer
   * Confirmer un rendez-vous
   */
  async confirmer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const rendezVous = await this.rendezVousService.confirmerRendezVous(id);

      if (!rendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        data: rendezVous,
        message: 'Rendez-vous confirmé'
      });
    } catch (error) {
      console.error('Erreur confirmation rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * PATCH /rendez-vous/:id/annuler
   * Annuler un rendez-vous
   */
  async annuler(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { raison } = req.body;
      const rendezVous = await this.rendezVousService.annulerRendezVous(id, raison);

      if (!rendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        data: rendezVous,
        message: 'Rendez-vous annulé'
      });
    } catch (error) {
      console.error('Erreur annulation rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * PATCH /rendez-vous/:id/terminer
   * Marquer un rendez-vous comme terminé
   */
  async marquerTermine(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const rendezVous = await this.rendezVousService.marquerTermine(id);

      if (!rendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        data: rendezVous,
        message: 'Rendez-vous marqué comme terminé'
      });
    } catch (error) {
      console.error('Erreur:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * PATCH /rendez-vous/:id/absent
   * Marquer un rendez-vous comme absent
   */
  async marquerAbsent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const rendezVous = await this.rendezVousService.marquerAbsent(id);

      if (!rendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        data: rendezVous,
        message: 'Rendez-vous marqué comme absent'
      });
    } catch (error) {
      console.error('Erreur:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }

  /**
   * PATCH /rendez-vous/:id/reporter
   * Reporter un rendez-vous
   */
  async reporter(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const { nouvelle_date, nouvelle_heure } = req.body;

      if (!nouvelle_date || !nouvelle_heure) {
        return res.status(400).json({
          success: false,
          message: 'Date et heure requises'
        });
      }

      const rendezVous = await this.rendezVousService.reporterRendezVous(
        id,
        nouvelle_date,
        nouvelle_heure
      );

      if (!rendezVous) {
        return res.status(404).json({
          success: false,
          message: 'Rendez-vous non trouvé'
        });
      }

      res.json({
        success: true,
        data: rendezVous,
        message: 'Rendez-vous reporté'
      });
    } catch (error) {
      console.error('Erreur report rendez-vous:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * GET /rendez-vous/creneaux-disponibles
   * Récupérer les créneaux disponibles pour un docteur
   */
  async getCreneauxDisponibles(req: Request, res: Response) {
    try {
      const { docteur_id, date, heure_debut, heure_fin, duree_creneau } = req.query;

      if (!docteur_id || !date) {
        return res.status(400).json({
          success: false,
          message: 'ID docteur et date requis'
        });
      }

      const creneaux = await this.rendezVousService.getCreneauxDisponibles(
        parseInt(docteur_id as string),
        date as string,
        (heure_debut as string) || '08:00',
        (heure_fin as string) || '18:00',
        parseInt((duree_creneau as string) || '30')
      );

      res.json({
        success: true,
        data: creneaux
      });
    } catch (error) {
      console.error('Erreur récupération créneaux:', error);
      const message = error instanceof Error ? error.message : 'Erreur serveur';
      res.status(500).json({
        success: false,
        message
      });
    }
  }
}