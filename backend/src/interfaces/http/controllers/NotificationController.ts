// backend/src/interfaces/http/controllers/NotificationController.ts

import { Response, NextFunction } from 'express';
import { AuthRequest }  from '../middlewares/auth.middleware';
import { pool }         from '../../../config/database';
import { HTTP_STATUS }  from '../../../config/constants';

export class NotificationController {

  // GET /notifications — liste paginée avec filtre
  getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id_user    = req.user!.id_user;
      const unreadOnly = req.query.unreadOnly === 'true';
      const page       = parseInt(req.query.page  as string) || 1;
      const limit      = parseInt(req.query.limit as string) || 20;
      const offset     = (page - 1) * limit;

      const whereClause = unreadOnly
        ? 'WHERE id_destinataire = $1 AND lue = false'
        : 'WHERE id_destinataire = $1';

      const [dataResult, countResult] = await Promise.all([
        pool.query(
          `SELECT * FROM notification
           ${whereClause}
           ORDER BY date_creation_notif DESC
           LIMIT $2 OFFSET $3`,
          [id_user, limit, offset]
        ),
        pool.query(
          `SELECT COUNT(*) FROM notification ${whereClause}`,
          [id_user]
        ),
      ]);

      const unreadResult = await pool.query(
        'SELECT COUNT(*) FROM notification WHERE id_destinataire = $1 AND lue = false',
        [id_user]
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dataResult.rows,
        pagination: {
          page, limit,
          total:      parseInt(countResult.rows[0].count),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
        },
        unreadCount: parseInt(unreadResult.rows[0].count),
      });
    } catch (error) { next(error); }
  };

  // PATCH /notifications/:id/lire
  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id));
      await pool.query(
        'UPDATE notification SET lue = true, date_lecture = NOW() WHERE id_notification = $1 AND id_destinataire = $2',
        [id, req.user!.id_user]
      );
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Notification lue' });
    } catch (error) { next(error); }
  };

  // PATCH /notifications/lire-tout
  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await pool.query(
        'UPDATE notification SET lue = true, date_lecture = NOW() WHERE id_destinataire = $1 AND lue = false',
        [req.user!.id_user]
      );
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Toutes les notifications lues' });
    } catch (error) { next(error); }
  };

  // DELETE /notifications/:id
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id));
      await pool.query(
        'DELETE FROM notification WHERE id_notification = $1 AND id_destinataire = $2',
        [id, req.user!.id_user]
      );
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Notification supprimée' });
    } catch (error) { next(error); }
  };

  // DELETE /notifications — supprimer toutes les notifications lues
  deleteAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await pool.query(
        'DELETE FROM notification WHERE id_destinataire = $1 AND lue = true',
        [req.user!.id_user]
      );
      res.status(HTTP_STATUS.OK).json({ success: true, message: 'Notifications lues supprimées' });
    } catch (error) { next(error); }
  };

  // GET /notifications/count — juste le compteur non lus
  getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) FROM notification WHERE id_destinataire = $1 AND lue = false',
        [req.user!.id_user]
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { count: parseInt(result.rows[0].count) },
      });
    } catch (error) { next(error); }
  };
}