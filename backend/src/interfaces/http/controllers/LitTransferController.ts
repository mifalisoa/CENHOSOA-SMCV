// backend/src/interfaces/http/controllers/LitTransferController.ts

import { Request, Response } from 'express';
import { LitTransferService } from '../../../application/services/LitTransferService';

import { pool } from '../../../config/database';

export class LitTransferController {
  private litTransferService: LitTransferService;

  constructor() {
    this.litTransferService = new LitTransferService(pool);
  }

  /**
   * POST /patients/:id/transferer-lit
   * Transférer un patient vers un nouveau lit
   */
  async transferer(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id as string);
      const { ancien_lit, nouveau_lit, motif_transfert, date_transfert } = req.body;

      // Validation
      if (!ancien_lit || !nouveau_lit) {
        return res.status(400).json({
          success: false,
          message: 'Ancien lit et nouveau lit requis'
        });
      }

      if (!motif_transfert) {
        return res.status(400).json({
          success: false,
          message: 'Motif de transfert requis'
        });
      }

      await this.litTransferService.transfererPatient({
        id_patient: patientId,
        ancien_lit: parseInt(ancien_lit),
        nouveau_lit: parseInt(nouveau_lit),
        motif_transfert,
        date_transfert
      });

      res.json({
        success: true,
        message: 'Patient transféré avec succès'
      });
    } catch (error) {
      console.error('Erreur transfert lit:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors du transfert';
      res.status(400).json({
        success: false,
        message
      });
    }
  }

  /**
   * GET /patients/:id/historique-transferts
   * Récupérer l'historique des transferts d'un patient
   */
  async getHistorique(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.id as string);
      const historique = await this.litTransferService.getHistoriqueTransferts(patientId);

      res.json({
        success: true,
        data: historique
      });
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }
}