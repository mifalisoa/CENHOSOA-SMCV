// backend/src/infrastructure/database/postgres/repositories/PostgresLitRepository.ts

import { Pool } from 'pg';
import { ILitRepository } from '../../../../domain/repositories/ILitRepository';
import { Lit, CreateLitDTO, UpdateLitDTO } from '../../../../domain/entities/Lit';

const mapRow = (r: Record<string, unknown>): Lit => ({ ...r, statut: r.statut_lit } as unknown as Lit);

export class PostgresLitRepository implements ILitRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateLitDTO): Promise<Lit> {
        const result = await this.pool.query(
            `INSERT INTO lit (numero_lit, categorie, statut_lit, etage, chambre, service_lit, type_lit)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [data.numero_lit, data.categorie, data.statut ?? 'disponible', data.etage ?? null, data.chambre ?? null, data.service_lit ?? 'Cardiologie', data.type_lit ?? 'standard']
        );
        return mapRow(result.rows[0]);
    }

    async findById(id: number): Promise<Lit | null> {
        const result = await this.pool.query('SELECT * FROM lit WHERE id_lit = $1', [id]);
        return result.rows[0] ? mapRow(result.rows[0]) : null;
    }

    async findAll(): Promise<Lit[]> {
        const result = await this.pool.query('SELECT * FROM lit WHERE actif_lit = true ORDER BY categorie, numero_lit');
        return result.rows.map(mapRow);
    }

    async findAvailable(categorie?: string): Promise<Lit[]> {
        const values: unknown[] = [];
        let query = "SELECT * FROM lit WHERE statut_lit = 'disponible' AND actif_lit = true";
        if (categorie) { query += ' AND categorie = $1'; values.push(categorie); }
        query += ' ORDER BY categorie, numero_lit';
        const result = await this.pool.query(query, values);
        return result.rows.map(mapRow);
    }

    async update(id: number, data: UpdateLitDTO): Promise<Lit | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let i = 1;

        if (data.numero_lit  !== undefined) { fields.push(`numero_lit  = $${i++}`); values.push(data.numero_lit);  }
        if (data.categorie   !== undefined) { fields.push(`categorie   = $${i++}`); values.push(data.categorie);   }
        if (data.statut      !== undefined) { fields.push(`statut_lit  = $${i++}`); values.push(data.statut);      }
        if (data.etage       !== undefined) { fields.push(`etage       = $${i++}`); values.push(data.etage);       }
        if (data.chambre     !== undefined) { fields.push(`chambre     = $${i++}`); values.push(data.chambre);     }
        if (data.service_lit !== undefined) { fields.push(`service_lit = $${i++}`); values.push(data.service_lit); }
        if (data.type_lit    !== undefined) { fields.push(`type_lit    = $${i++}`); values.push(data.type_lit);    }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const result = await this.pool.query(
            `UPDATE lit SET ${fields.join(', ')} WHERE id_lit = $${i} RETURNING *`,
            values
        );
        return result.rows[0] ? mapRow(result.rows[0]) : null;
    }

    async updateStatus(id: number, status: string): Promise<boolean> {
        const result = await this.pool.query('UPDATE lit SET statut_lit = $1 WHERE id_lit = $2', [status, id]);
        return (result.rowCount ?? 0) > 0;
    }

    async isAvailable(id: number): Promise<boolean> {
        const result = await this.pool.query('SELECT statut_lit FROM lit WHERE id_lit = $1', [id]);
        return result.rows.length > 0 && result.rows[0].statut_lit === 'disponible';
    }
}