// backend/src/interfaces/http/routes/setup.routes.ts

import { Router }          from 'express';
import { SetupController } from '../controllers/SetupController';

const router     = Router();
const controller = new SetupController();

// Setup initial
router.get( '/status',  controller.status);
router.post('/',        controller.setup);

// Reset mot de passe
router.post('/mot-de-passe-oublie',          controller.motDePasseOublie);
router.get( '/reset-password/:token/verify', controller.verifyResetToken);
router.post('/reset-password',               controller.resetPassword);

export default router;