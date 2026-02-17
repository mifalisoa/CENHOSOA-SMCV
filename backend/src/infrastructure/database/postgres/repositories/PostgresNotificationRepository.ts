import { Pool } from 'pg';
import { INotificationRepository } from '../../../../domain/repositories/INotificationRepository';
import { Notification, CreateNotificationDTO } from '../../../../domain/entities/Notification';

export class PostgresNotificationRepository implements INotificationRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateNotificationDTO): Promise<Notification> {
        const query = `
            INSERT INTO notification (
                id_destinataire, titre_notif, message_notif, type_notif,
                priorite, urgence, lien
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            data.id_destinataire,
            data.titre_notif,
            data.message_notif,
            data.type_notif || null,
            data.priorite || 'normale',
            data.urgence || false,
            data.lien || null,
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<Notification | null> {
        const query = 'SELECT * FROM notification WHERE id_notification = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByUser(idUser: number, luesIncluses = false): Promise<Notification[]> {
        let query = 'SELECT * FROM notification WHERE id_destinataire = $1';

        if (!luesIncluses) {
            query += ' AND lue = false';
        }

        query += ' ORDER BY date_creation_notif DESC';

        const result = await this.pool.query(query, [idUser]);
        return result.rows;
    }

    async findUnreadByUser(idUser: number): Promise<Notification[]> {
        const query = `
            SELECT * FROM notification
            WHERE id_destinataire = $1 AND lue = false
            ORDER BY priorite DESC, date_creation_notif DESC
        `;
        const result = await this.pool.query(query, [idUser]);
        return result.rows;
    }

    async markAsRead(id: number): Promise<boolean> {
        const query = `
            UPDATE notification
            SET lue = true, date_lecture = CURRENT_TIMESTAMP
            WHERE id_notification = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async markAllAsRead(idUser: number): Promise<boolean> {
        const query = `
            UPDATE notification
            SET lue = true, date_lecture = CURRENT_TIMESTAMP
            WHERE id_destinataire = $1 AND lue = false
        `;
        const result = await this.pool.query(query, [idUser]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM notification WHERE id_notification = $1';
        const result = await this.pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}