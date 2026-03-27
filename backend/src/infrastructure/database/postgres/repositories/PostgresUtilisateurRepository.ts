// backend/src/infrastructure/database/postgres/repositories/PostgresUtilisateurRepository.ts

import { Pool } from 'pg';
import { IUtilisateurRepository } from '../../../../domain/repositories/IUtilisateurRepository';
import { Utilisateur, CreateUtilisateurDTO, UpdateUtilisateurDTO, UtilisateurWithoutPassword } from '../../../../domain/entities/Utilisateur';
import { PaginatedResponse, PaginationParams } from '../../../../shared/types';

// Colonnes retournées sans mot_de_passe — réutilisées dans tous les SELECT
const COLS_WITHOUT_PASSWORD = `
    id_user, nom, prenom, email, role,
    specialite, telephone, actif, statut, created_at, derniere_connexion, updated_at
`;

export class PostgresUtilisateurRepository implements IUtilisateurRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateUtilisateurDTO): Promise<Utilisateur> {
        const query = `
            INSERT INTO utilisateurs (
                nom, prenom, email, mot_de_passe,
                role, specialite, telephone, statut
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            data.nom,
            data.prenom,
            data.email,
            data.mot_de_passe,
            data.role,
            data.specialite  || null,
            data.telephone   || null,
            data.statut      || 'actif',
        ];
        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<Utilisateur | null> {
        const query = 'SELECT * FROM utilisateurs WHERE id_user = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByEmail(email: string): Promise<Utilisateur | null> {
        const query = 'SELECT * FROM utilisateurs WHERE email = $1';
        const result = await this.pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async findAll(params: PaginationParams): Promise<PaginatedResponse<UtilisateurWithoutPassword>> {
        const page   = params.page  || 1;
        const limit  = params.limit || 10;
        const offset = (page - 1) * limit;

        const countResult = await this.pool.query('SELECT COUNT(*) FROM utilisateurs');
        const total = parseInt(countResult.rows[0].count);

        const query = `
            SELECT ${COLS_WITHOUT_PASSWORD}
            FROM utilisateurs
            ORDER BY nom, prenom
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
        // Filtre sur statut = 'actif' (remplace l'ancien actif_user = true)
        const query = `
            SELECT ${COLS_WITHOUT_PASSWORD}
            FROM utilisateurs
            WHERE role = $1 AND statut = 'actif'
            ORDER BY nom, prenom
        `;
        const result = await this.pool.query(query, [role]);
        return result.rows;
    }

    async findActive(): Promise<UtilisateurWithoutPassword[]> {
        const query = `
            SELECT ${COLS_WITHOUT_PASSWORD}
            FROM utilisateurs
            WHERE statut = 'actif'
            ORDER BY nom, prenom
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async update(id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let i = 1;

        // Mapping des champs autorisés à la mise à jour
        const allowed: Array<keyof UpdateUtilisateurDTO> = [
            'nom', 'prenom', 'email', 'role',
            'specialite', 'telephone', 'statut'
        ];

        for (const key of allowed) {
            if (data[key] !== undefined) {
                fields.push(`${String(key)} = $${i++}`);
                values.push(data[key]);
            }
        }

        if (fields.length === 0) return this.findById(id);

        // updated_at géré par trigger, mais on le force aussi ici par sécurité
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE utilisateurs
            SET ${fields.join(', ')}
            WHERE id_user = $${i}
            RETURNING *
        `;
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async updatePassword(id: number, newPassword: string): Promise<boolean> {
        const query = `
            UPDATE utilisateurs
            SET mot_de_passe = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $2
        `;
        const result = await this.pool.query(query, [newPassword, id]);
        return (result.rowCount ?? 0) > 0;
    }

    async deactivate(id: number): Promise<boolean> {
        const query = `
            UPDATE utilisateurs
            SET statut = 'inactif', actif = false, updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
        `;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async activate(id: number): Promise<boolean> {
        const query = `
            UPDATE utilisateurs
            SET statut = 'actif', actif = true, updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
        `;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async suspend(id: number): Promise<boolean> {
        const query = `
            UPDATE utilisateurs
            SET statut = 'suspendu', actif = false, updated_at = CURRENT_TIMESTAMP
            WHERE id_user = $1
        `;
        const result = await this.pool.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async updateLastLogin(id: number): Promise<void> {
        const query = `
            UPDATE utilisateurs
            SET derniere_connexion = CURRENT_TIMESTAMP
            WHERE id_user = $1
        `;
        await this.pool.query(query, [id]);
    }

    async emailExists(email: string, excludeId?: number): Promise<boolean> {
        let query  = 'SELECT EXISTS(SELECT 1 FROM utilisateurs WHERE email = $1';
        const vals: unknown[] = [email];

        if (excludeId) {
            query += ' AND id_user != $2';
            vals.push(excludeId);
        }

        query += ')';
        const result = await this.pool.query(query, vals);
        return result.rows[0].exists;
    }
}