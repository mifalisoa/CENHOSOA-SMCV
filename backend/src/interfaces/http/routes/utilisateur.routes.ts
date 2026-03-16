// backend/src/interfaces/http/routes/utilisateurs.routes.ts

import { Router } from 'express';
import { UtilisateursController } from '../controllers/UtilisateurController';

const router = Router();
const controller = new UtilisateursController();

// Routes utilisateurs
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.patch('/:id/statut', (req, res) => controller.changeStatut(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;