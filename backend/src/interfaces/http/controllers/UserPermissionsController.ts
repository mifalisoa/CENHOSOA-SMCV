// backend/src/interfaces/http/controllers/UserPermissionsController.ts

import { Response, NextFunction } from 'express';
import { AuthRequest }                      from '../middlewares/auth.middleware';
import { PostgresUserPermissionsRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUserPermissionsRepository';
import { PostgresUtilisateurRepository }     from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { pool }                              from '../../../config/database';
import { ALL_PERMISSIONS }                   from '../../../shared/constants/permissions';

const permissionsRepo  = new PostgresUserPermissionsRepository(pool);
const utilisateurRepo  = new PostgresUtilisateurRepository(pool);

export class UserPermissionsController {

  // GET /utilisateurs/:id/permissions
  async getPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id_user = parseInt(String(req.params.id));

      // Récupérer le rôle de l'utilisateur
      const utilisateur = await utilisateurRepo.findById(id_user);
      if (!utilisateur) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        return;
      }

      const permissions = await permissionsRepo.getByUserId(id_user, utilisateur.role);

      res.json({
        success: true,
        data: {
          id_user,
          role:        utilisateur.role,
          permissions,
          isCustomized: await isCustomized(id_user),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /utilisateurs/:id/permissions
  async setPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id_user     = parseInt(String(req.params.id));
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        res.status(400).json({ success: false, message: 'permissions doit être un tableau' });
        return;
      }

      // Valider que toutes les permissions existent
      const invalid = permissions.filter(
        (p: string) => !(ALL_PERMISSIONS as readonly string[]).includes(p)
      );
      if (invalid.length > 0) {
        res.status(400).json({
          success: false,
          message: `Permissions invalides : ${invalid.join(', ')}`,
        });
        return;
      }

      await permissionsRepo.setPermissions(id_user, permissions);

      res.json({ success: true, message: 'Permissions mises à jour avec succès' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /utilisateurs/:id/permissions — réinitialise aux défauts du rôle
  async resetPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id_user = parseInt(String(req.params.id));
      await permissionsRepo.setPermissions(id_user, []); // tableau vide = défauts du rôle
      res.json({ success: true, message: 'Permissions réinitialisées aux défauts du rôle' });
    } catch (error) {
      next(error);
    }
  }
}

// Helper — vérifie si l'utilisateur a des permissions personnalisées
async function isCustomized(id_user: number): Promise<boolean> {
  const result = await pool.query(
    'SELECT COUNT(*) FROM user_permissions WHERE id_user = $1',
    [id_user]
  );
  return parseInt(result.rows[0].count) > 0;
}