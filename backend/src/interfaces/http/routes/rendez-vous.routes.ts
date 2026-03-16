// backend/src/interfaces/http/routes/rendez-vous.routes.ts

import { Router } from 'express';
import { RendezVousController } from '../controllers/RendezVousController';

const router = Router();
const controller = new RendezVousController();

// ==========================================
// ROUTES RENDEZ-VOUS
// ==========================================

/**
 * GET /api/rendez-vous
 * Query params: 
 *   - date: string (YYYY-MM-DD)
 *   - date_debut: string
 *   - date_fin: string
 *   - patient_id: number
 *   - docteur_id: number
 */
router.get('/', (req, res) => controller.getAll(req, res));

/**
 * GET /api/rendez-vous/creneaux-disponibles
 * IMPORTANT: Doit être AVANT /:id pour éviter conflit
 */
router.get('/creneaux-disponibles', (req, res) => controller.getCreneauxDisponibles(req, res));

/**
 * GET /api/rendez-vous/:id
 */
router.get('/:id', (req, res) => controller.getById(req, res));

/**
 * POST /api/rendez-vous
 */
router.post('/', (req, res) => controller.create(req, res));

/**
 * PUT /api/rendez-vous/:id
 */
router.put('/:id', (req, res) => controller.update(req, res));

/**
 * DELETE /api/rendez-vous/:id
 */
router.delete('/:id', (req, res) => controller.delete(req, res));

/**
 * PATCH /api/rendez-vous/:id/confirmer
 */
router.patch('/:id/confirmer', (req, res) => controller.confirmer(req, res));

/**
 * PATCH /api/rendez-vous/:id/annuler
 */
router.patch('/:id/annuler', (req, res) => controller.annuler(req, res));

/**
 * PATCH /api/rendez-vous/:id/terminer
 */
router.patch('/:id/terminer', (req, res) => controller.marquerTermine(req, res));

/**
 * PATCH /api/rendez-vous/:id/absent
 */
router.patch('/:id/absent', (req, res) => controller.marquerAbsent(req, res));

/**
 * PATCH /api/rendez-vous/:id/reporter
 */
router.patch('/:id/reporter', (req, res) => controller.reporter(req, res));

export default router;