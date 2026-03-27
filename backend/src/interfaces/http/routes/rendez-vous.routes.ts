// backend/src/interfaces/http/routes/rendez-vous.routes.ts

import { Router } from 'express';
import { RendezVousController } from '../controllers/RendezVousController';
import { authMiddleware }       from '../middlewares/auth.middleware';

const router     = Router();
const controller = new RendezVousController();

//  Toutes les routes nécessitent un token valide
router.use(authMiddleware);

router.get('/',                         (req, res) => controller.getAll(req, res));
router.get('/creneaux-disponibles',     (req, res) => controller.getCreneauxDisponibles(req, res));
router.get('/:id',                      (req, res) => controller.getById(req, res));
router.post('/',                        (req, res) => controller.create(req, res));
router.put('/:id',                      (req, res) => controller.update(req, res));
router.delete('/:id',                   (req, res) => controller.delete(req, res));
router.patch('/:id/confirmer',          (req, res) => controller.confirmer(req, res));
router.patch('/:id/annuler',            (req, res) => controller.annuler(req, res));
router.patch('/:id/terminer',           (req, res) => controller.marquerTermine(req, res));
router.patch('/:id/absent',             (req, res) => controller.marquerAbsent(req, res));
router.patch('/:id/reporter',           (req, res) => controller.reporter(req, res));

export default router;