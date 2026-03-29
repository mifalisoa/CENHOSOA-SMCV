// backend/src/application/services/NotificationService.ts

import { Pool }    from 'pg';
import { getIO }   from '../../config/socket';
import { pool }    from '../../config/database';
import { PostgresUtilisateurRepository } from '../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';

const utilisateurRepo = new PostgresUtilisateurRepository(pool);

export interface NotificationData {
  titre:    string;
  message:  string;
  type:     'rdv' | 'admission' | 'urgence' | 'systeme' | 'info';
  priorite: 'basse' | 'normale' | 'haute' | 'critique';
  lien?:    string;
  urgence?: boolean;
}

export class NotificationService {
  constructor(private pool: Pool) {}

  // Envoyer une notification à un utilisateur spécifique
  async notifyUser(id_destinataire: number, data: NotificationData): Promise<void> {
    const notif = await this.save(id_destinataire, data);
    this.emit(id_destinataire, notif);
  }

  // Envoyer une notification à tous les admins
  async notifyAdmins(data: NotificationData): Promise<void> {
    const admins = await utilisateurRepo.findByRole('admin');
    for (const admin of admins) {
      const notif = await this.save(admin.id_user, data);
      this.emit(admin.id_user, notif);
    }
  }

  // ✅ Envoyer une notification à tous les secrétaires
  async notifySecretaires(data: NotificationData): Promise<void> {
    const secretaires = await utilisateurRepo.findByRole('secretaire');
    for (const secretaire of secretaires) {
      const notif = await this.save(secretaire.id_user, data);
      this.emit(secretaire.id_user, notif);
    }
  }

  // ✅ Envoyer à admins ET secrétaires en même temps
  async notifyAdminsAndSecretaires(data: NotificationData): Promise<void> {
    await Promise.all([
      this.notifyAdmins(data),
      this.notifySecretaires(data),
    ]);
  }

  // Sauvegarder en DB
  private async save(id_destinataire: number, data: NotificationData) {
    const result = await this.pool.query(
      `INSERT INTO notification
        (id_destinataire, titre_notif, message_notif, type_notif, priorite, urgence, lien)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id_destinataire,
        data.titre,
        data.message,
        data.type,
        data.priorite,
        data.urgence ?? false,
        data.lien ?? null,
      ]
    );
    return result.rows[0];
  }

  // Émettre via Socket.io vers la room de l'utilisateur
  private emit(id_destinataire: number, notif: Record<string, unknown>): void {
    try {
      const io = getIO();
      io.to(`user_${id_destinataire}`).emit('notification', notif);
    } catch {
      // Socket.io non initialisé — pas critique, la notif est déjà en DB
    }
  }
}

// Instance partagée
export const notificationService = new NotificationService(pool);