import { Pool } from 'pg';
import { ILitRepository } from '../../../../domain/repositories/ILitRepository';
import { Lit, CreateLitDTO, UpdateLitDTO } from '../../../../domain/entities/Lit';

export class PostgresLitRepository implements ILitRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateLitDTO): Promise<Lit> {
        const query = `
            INSERT INTO lit (
                numero_lit, etage, chambre, service_lit, type_lit,
                statut_lit, actif_lit, remarques_lit
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            data.numero_lit,
            data.etage || null,
            data.chambre || null,
            data.service_lit,
            data.type_lit || null,
            data.statut_lit || 'disponible',
            data.actif_lit !== undefined ? data.actif_lit : true,
            data.remarques_lit || null,
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<Lit | null> {
        const query = 'SELECT * FROM lit WHERE id_lit = $1';
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findAll(): Promise<Lit[]> {
        const query = `
            SELECT * FROM lit
            WHERE actif_lit = true
            ORDER BY etage, chambre, numero_lit
        `;
        const result = await this.pool.query(query);
        return result.rows;
    }

    async findAvailable(service?: string): Promise<Lit[]> {
        let query = `
            SELECT * FROM lit
            WHERE statut_lit = 'disponible' AND actif_lit = true
        `;

        const values: any[] = [];

        if (service) {
            query += ' AND service_lit = $1';
            values.push(service);
        }

        query += ' ORDER BY etage, chambre, numero_lit';

        const result = await this.pool.query(query, values);
        return result.rows;
    }

    async update(id: number, data: UpdateLitDTO): Promise<Lit | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCounter++}`);
                values.push(value);
            }
        });

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const query = `
            UPDATE lit
            SET ${fields.join(', ')}
            WHERE id_lit = $${paramCounter}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async updateStatus(id: number, status: string): Promise<boolean> {
        const query = `
            UPDATE lit
            SET statut_lit = $1
            WHERE id_lit = $2
        `;
        const result = await this.pool.query(query, [status, id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async isAvailable(id: number): Promise<boolean> {
        const query = `
            SELECT statut_lit FROM lit
            WHERE id_lit = $1 AND actif_lit = true
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows.length > 0 && result.rows[0].statut_lit === 'disponible';
    }
}