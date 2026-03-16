// backend/src/interfaces/http/controllers/SecuriteController.ts
//
// NOTE : les tables sessions_actives, alertes_securite, logs_action,
// ips_bloquees, parametres_securite ont été supprimées lors de la migration.
// Les endpoints correspondants retournent des données vides ou un message
// explicatif jusqu'à ce qu'une nouvelle implémentation soit prévue.

import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

export class SecuriteController {

  // GET /api/securite/stats
  async getStats(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        sessions_actives: 0,
        tentatives_echouees_24h: 0,
        actions_aujourdhui: 0,
        alertes_non_lues: 0,
        _info: 'Module sécurité en cours de refactoring'
      }
    });
  }

  // GET /api/securite/sessions
  async getSessions(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [],
      _info: 'La table sessions_actives a été supprimée lors de la migration'
    });
  }

  // DELETE /api/securite/sessions/:sessionId
  async disconnectSession(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const user = authReq.user;
    const { sessionId } = req.params;

    console.log(`🚪 [SecuriteController] disconnectSession - Session: ${sessionId} par ${user?.email}`);

    res.json({
      success: true,
      message: 'Fonctionnalité non disponible — sessions_actives supprimée'
    });
  }

  // GET /api/securite/alertes
  async getAlertes(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [],
      _info: 'La table alertes_securite a été supprimée lors de la migration'
    });
  }

  // PATCH /api/securite/alertes/:id
  async updateAlerte(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Fonctionnalité non disponible — alertes_securite supprimée'
    });
  }

  // GET /api/securite/logs
  async getLogs(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [],
      pagination: { total: 0, limit: 100, offset: 0, totalPages: 0 },
      _info: 'La table logs_action a été supprimée lors de la migration'
    });
  }

  // GET /api/securite/parametres
  async getParametres(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {},
      _info: 'La table parametres_securite a été supprimée lors de la migration'
    });
  }

  // PUT /api/securite/parametres/:cle
  async updateParametre(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Fonctionnalité non disponible — parametres_securite supprimée'
    });
  }

  // POST /api/securite/ips/bloquer
  async bloquerIP(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Fonctionnalité non disponible — ips_bloquees supprimée'
    });
  }

  // DELETE /api/securite/ips/:id
  async debloquerIP(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Fonctionnalité non disponible — ips_bloquees supprimée'
    });
  }

  // GET /api/securite/ips
  async getIPsBloquees(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [],
      _info: 'La table ips_bloquees a été supprimée lors de la migration'
    });
  }
}