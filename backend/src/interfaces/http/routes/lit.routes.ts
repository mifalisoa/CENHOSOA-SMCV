import { Router } from 'express';
import { pool } from '../../../config/database';
import { LitService } from '../../../application/services/LitService';
import { LitController } from '../controllers/LitController';

const router = Router();

// Initialiser le service et controller
const litService = new LitService(pool);
const litController = new LitController(litService);

/**
 * @route GET /api/lits
 * @desc Récupérer tous les lits avec occupation
 */
router.get('/', litController.getAllLits);

/**
 * @route GET /api/lits/statistiques
 * @desc Statistiques des lits
 */
router.get('/statistiques', litController.getStatistiques);

/**
 * @route POST /api/lits/initialiser
 * @desc Initialiser les 21 lits CENHOSOA
 */
router.post('/initialiser', litController.initialiserLits);

/**
 * @route GET /api/lits/:id
 * @desc Récupérer un lit par ID
 */
router.get('/:id', litController.getLitById);

/**
 * @route POST /api/lits
 * @desc Créer un nouveau lit
 */
router.post('/', litController.createLit);

/**
 * @route PUT /api/lits/:id
 * @desc Mettre à jour un lit
 */
router.put('/:id', litController.updateLit);

/**
 * @route DELETE /api/lits/:id
 * @desc Supprimer un lit
 */
router.delete('/:id', litController.deleteLit);

/**
 * @route POST /api/lits/:id/liberer
 * @desc Libérer un lit (disponible)
 */
router.post('/:id/liberer', litController.libererLit);

export default router;