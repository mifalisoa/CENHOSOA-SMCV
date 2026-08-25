// backend/src/interfaces/http/routes/userPermissions.routes.ts

import { Router, Response, NextFunction }  from 'express';
import { UserPermissionsController }        from '../controllers/UserPermissionsController';
import { authMiddleware, AuthRequest }      from '../middlewares/auth.middleware';
import { roleMiddleware }                   from '../middlewares/role.middleware';
import { logAction }                        from '../middlewares/action-logger.middleware';

const router     = Router();
const controller = new UserPermissionsController();

router.use(authMiddleware);

// Autorise l'admin OU l'utilisateur qui consulte ses propres permissions
const selfOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const requestedId = parseInt(String(req.params.id), 10);
  if (req.user?.role === 'admin' || req.user?.id_user === requestedId) {
    next();
    return;
  }
  res.status(403).json({ success: false, message: 'Accès refusé' });
};

// Lecture — admin OU l'utilisateur lui-meme (necessaire pour usePermissions.ts)
router.get('/:id/permissions', selfOrAdmin, (req, res, next) => controller.getPermissions(req, res, next));

// Ecriture et suppression — reservees a l'admin uniquement
router.put(   '/:id/permissions', roleMiddleware(['admin']), logAction('update', 'utilisateurs'), (req, res, next) => controller.setPermissions(req, res, next));
router.delete('/:id/permissions', roleMiddleware(['admin']), logAction('delete', 'utilisateurs'), (req, res, next) => controller.resetPermissions(req, res, next));

export default router;