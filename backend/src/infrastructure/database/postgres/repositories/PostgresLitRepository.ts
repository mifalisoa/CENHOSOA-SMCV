import { Pool } from 'pg';
import { ILitRepository } from '../../../../domain/repositories/ILitRepository';
import { Lit, CreateLitDTO, UpdateLitDTO } from '../../../../domain/entities/Lit';

export class PostgresLitRepository implements ILitRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateLitDTO): Promise<Lit> {
        const query = `
            INSERT INTO lits (
                numero_lit, categorie, statut, etage, batiment
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            data.numero_lit,
            data.categorie,
            data.statut || 'disponible',
            data.etage || null,
            data.batiment || null,
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<Lit | null> {
        const query = 'SELECT * FROM lits WHERE id_lit = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findAll(): Promise<Lit[]> {
        const query = `
            SELECT * FROM lits
            ORDER BY etage, numero_lit
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async findAvailable(categorie?: string): Promise<Lit[]> {
        let query = `
            SELECT * FROM lits
            WHERE statut = 'disponible'
        `;

        const values: any[] = [];

        if (categorie) {
            query += ' AND categorie = $1';
            values.push(categorie);
        }

        query += ' ORDER BY etage, numero_lit';

        const result = await this.pool.query(query, values);
        return result.rows;
    }

    async update(id: number, data: UpdateLitDTO): Promise<Lit | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (data.numero_lit !== undefined) {
            fields.push(`numero_lit = $${paramCounter++}`);
            values.push(data.numero_lit);
        }
        if (data.categorie !== undefined) {
            fields.push(`categorie = $${paramCounter++}`);
            values.push(data.categorie);
        }
        if (data.statut !== undefined) {
            fields.push(`statut = $${paramCounter++}`);
            values.push(data.statut);
        }
        if (data.etage !== undefined) {
            fields.push(`etage = $${paramCounter++}`);
            values.push(data.etage);
        }
        if (data.batiment !== undefined) {
            fields.push(`batiment = $${paramCounter++}`);
            values.push(data.batiment);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `
            UPDATE lits
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id_lit = $${paramCounter}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async updateStatus(id: number, status: string): Promise<boolean> {
        const query = `
            UPDATE lits
            SET statut = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id_lit = $2
        `;
        const result = await this.pool.query(query, [status, id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async isAvailable(id: number): Promise<boolean> {
        const query = `
            SELECT statut FROM lits
            WHERE id_lit = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows.length > 0 && result.rows[0].statut === 'disponible';
    }
}