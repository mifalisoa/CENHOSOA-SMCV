// backend/src/interfaces/http/routes/userPermissions.routes.ts

import { Router }                    from 'express';
import { UserPermissionsController } from '../controllers/UserPermissionsController';
import { authMiddleware }             from '../middlewares/auth.middleware';
import { roleMiddleware }             from '../middlewares/role.middleware';
import { logAction }                  from '../middlewares/action-logger.middleware';

const router     = Router();
const controller = new UserPermissionsController();

router.use(authMiddleware);

// Seul l'admin peut voir et modifier les permissions
router.get(   '/:id/permissions', roleMiddleware(['admin']),                                           (req, res, next) => controller.getPermissions(req, res, next));
router.put(   '/:id/permissions', roleMiddleware(['admin']), logAction('update', 'utilisateurs'),      (req, res, next) => controller.setPermissions(req, res, next));
router.delete('/:id/permissions', roleMiddleware(['admin']), logAction('delete', 'utilisateurs'),      (req, res, next) => controller.resetPermissions(req, res, next));

export default router;