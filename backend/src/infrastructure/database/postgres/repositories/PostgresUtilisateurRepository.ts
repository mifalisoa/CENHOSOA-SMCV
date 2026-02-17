import { Pool } from 'pg';
import { IUtilisateurRepository } from '../../../../domain/repositories/IUtilisateurRepository';
import { Utilisateur, CreateUtilisateurDTO, UpdateUtilisateurDTO, UtilisateurWithoutPassword } from '../../../../domain/entities/Utilisateur';
import { PaginatedResponse, PaginationParams } from '../../../../shared/types';

export class PostgresUtilisateurRepository implements IUtilisateurRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateUtilisateurDTO): Promise<Utilisateur> {
        const query = `
            INSERT INTO utilisateur (
                nom_user, prenom_user, email_user, mdp_user, 
                role_user, specialite_user, tel_user
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            data.nom_user,
            data.prenom_user,
            data.email_user,
            data.mdp_user,
            data.role_user,
            data.specialite_user || null,
            data.tel_user || null,
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<Utilisateur | null> {
        const query = 'SELECT * FROM utilisateur WHERE id_user = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByEmail(email: string): Promise<Utilisateur | null> {
        const query = 'SELECT * FROM utilisateur WHERE email_user = $1';
        const result = await this.pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async findAll(params: PaginationParams): Promise<PaginatedResponse<UtilisateurWithoutPassword>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const offset = (page - 1) * limit;

        const countQuery = 'SELECT COUNT(*) FROM utilisateur';
        const countResult = await this.pool.query(countQuery);
        const total = parseInt(countResult.rows[0].count);

        const query = `
            SELECT 
                id_user, nom_user, prenom_user, email_user, role_user,
                specialite_user, tel_user, actif_user, date_creation_user, derniere_connexion
            FROM utilisateur
            ORDER BY nom_user, prenom_user
            LIMIT $1 OFFSET $2
        `;
        const result = await this.pool.query(query, [limit, offset]);

        return {
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findByRole(role: string): Promise<UtilisateurWithoutPassword[]> {
        const query = `
            SELECT 
                id_user, nom_user, prenom_user, email_user, role_user,
                specialite_user, tel_user, actif_user, date_creation_user, derniere_connexion
            FROM utilisateur
            WHERE role_user = $1 AND actif_user = true
            ORDER BY nom_user, prenom_user
        `;
        const result = await this.pool.query(query, [role]);
        return result.rows;
    }

    async findActive(): Promise<UtilisateurWithoutPassword[]> {
        const query = `
            SELECT 
                id_user, nom_user, prenom_user, email_user, role_user,
                specialite_user, tel_user, actif_user, date_creation_user, derniere_connexion
            FROM utilisateur
            WHERE actif_user = true
            ORDER BY nom_user, prenom_user
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async update(id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (data.nom_user !== undefined) {
            fields.push(`nom_user = $${paramCounter++}`);
            values.push(data.nom_user);
        }
        if (data.prenom_user !== undefined) {
            fields.push(`prenom_user = $${paramCounter++}`);
            values.push(data.prenom_user);
        }
        if (data.email_user !== undefined) {
            fields.push(`email_user = $${paramCounter++}`);
            values.push(data.email_user);
        }
        if (data.role_user !== undefined) {
            fields.push(`role_user = $${paramCounter++}`);
            values.push(data.role_user);
        }
        if (data.specialite_user !== undefined) {
            fields.push(`specialite_user = $${paramCounter++}`);
            values.push(data.specialite_user);
        }
        if (data.tel_user !== undefined) {
            fields.push(`tel_user = $${paramCounter++}`);
            values.push(data.tel_user);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `
            UPDATE utilisateur
            SET ${fields.join(', ')}
            WHERE id_user = $${paramCounter}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async updatePassword(id: number, newPassword: string): Promise<boolean> {
        const query = 'UPDATE utilisateur SET mdp_user = $1 WHERE id_user = $2';
        const result = await this.pool.query(query, [newPassword, id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async deactivate(id: number): Promise<boolean> {
        const query = 'UPDATE utilisateur SET actif_user = false WHERE id_user = $1';
        const result = await this.pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async activate(id: number): Promise<boolean> {
        const query = 'UPDATE utilisateur SET actif_user = true WHERE id_user = $1';
        const result = await this.pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async updateLastLogin(id: number): Promise<void> {
        const query = 'UPDATE utilisateur SET derniere_connexion = CURRENT_TIMESTAMP WHERE id_user = $1';
        await this.pool.query(query, [id]);
    }

    async emailExists(email: string, excludeId?: number): Promise<boolean> {
        let query = 'SELECT EXISTS(SELECT 1 FROM utilisateur WHERE email_user = $1';
        const values: any[] = [email];

        if (excludeId) {
            query += ' AND id_user != $2';
            values.push(excludeId);
        }

        query += ')';

        const result = await this.pool.query(query, values);
        return result.rows[0].exists;
    }
}