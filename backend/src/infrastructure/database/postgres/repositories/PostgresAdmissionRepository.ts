// backend/src/infrastructure/database/postgres/repositories/PostgresAdmissionRepository.ts

import { Pool } from 'pg';
import { IAdmissionRepository } from '../../../../domain/repositories/IAdmissionRepository';
import { Admission, CreateAdmissionDTO, UpdateAdmissionDTO } from '../../../../domain/entities/Admission';
import { PaginatedResponse, PaginationParams } from '../../../../shared/types';

export class PostgresAdmissionRepository implements IAdmissionRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateAdmissionDTO): Promise<Admission> {
        const numAdmission = await this.generateNumAdmission();

        const result = await this.pool.query(
            `INSERT INTO admission (
                id_patient, id_docteur, id_secretaire, id_lit, num_admission,
                motif_admission, diagnostic_entree, type_admission, statut_admission,
                date_sortie_prevue, remarques_admission
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
            [
                data.id_patient, data.id_docteur, data.id_secretaire,
                data.id_lit || null, numAdmission,
                data.motif_admission, data.diagnostic_entree, data.type_admission,
                data.statut_admission || 'en_cours',
                data.date_sortie_prevue || null, data.remarques_admission || null,
            ]
        );
        return result.rows[0];
    }

    async findById(id: number): Promise<Admission | null> {
        const result = await this.pool.query(`
            SELECT a.*,
                   p.nom_patient, p.prenom_patient, p.num_dossier,
                   u.nom   AS nom_docteur,    u.prenom   AS prenom_docteur,
                   s.nom   AS nom_secretaire, s.prenom   AS prenom_secretaire,
                   l.numero_lit, l.service_lit
            FROM admission a
            JOIN patients     p ON a.id_patient    = p.id_patient
            JOIN utilisateurs u ON a.id_docteur    = u.id_user
            LEFT JOIN utilisateurs s ON a.id_secretaire = s.id_user
            LEFT JOIN lit     l ON a.id_lit        = l.id_lit
            WHERE a.id_admission = $1
        `, [id]);
        return result.rows[0] || null;
    }

    async findAll(params: PaginationParams): Promise<PaginatedResponse<Admission>> {
        const page   = params.page  || 1;
        const limit  = params.limit || 10;
        const offset = (page - 1) * limit;

        const countResult = await this.pool.query('SELECT COUNT(*) FROM admission');
        const total = parseInt(countResult.rows[0].count);

        const result = await this.pool.query(`
            SELECT a.*,
                   p.nom_patient, p.prenom_patient, p.num_dossier,
                   u.nom AS nom_docteur, u.prenom AS prenom_docteur,
                   l.numero_lit, l.service_lit
            FROM admission a
            JOIN patients     p ON a.id_patient = p.id_patient
            JOIN utilisateurs u ON a.id_docteur = u.id_user
            LEFT JOIN lit     l ON a.id_lit     = l.id_lit
            ORDER BY a.date_admission DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        return { data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async findByPatient(idPatient: number): Promise<Admission[]> {
        const result = await this.pool.query(`
            SELECT a.*,
                   u.nom AS nom_docteur, u.prenom AS prenom_docteur,
                   l.numero_lit, l.service_lit
            FROM admission a
            JOIN utilisateurs u ON a.id_docteur = u.id_user
            LEFT JOIN lit     l ON a.id_lit     = l.id_lit
            WHERE a.id_patient = $1
            ORDER BY a.date_admission DESC
        `, [idPatient]);
        return result.rows;
    }

    async findEnCours(): Promise<Admission[]> {
        const result = await this.pool.query(`
            SELECT a.*,
                   p.nom_patient, p.prenom_patient, p.num_dossier,
                   u.nom AS nom_docteur, u.prenom AS prenom_docteur,
                   l.numero_lit, l.service_lit
            FROM admission a
            JOIN patients     p ON a.id_patient = p.id_patient
            JOIN utilisateurs u ON a.id_docteur = u.id_user
            LEFT JOIN lit     l ON a.id_lit     = l.id_lit
            WHERE a.statut_admission = 'en_cours'
            ORDER BY a.date_admission DESC
        `);
        return result.rows;
    }

    async update(id: number, data: UpdateAdmissionDTO): Promise<Admission | null> {
        const fields: string[] = [];
        const values: unknown[] = [];
        let paramCounter = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${paramCounter++}`);
                values.push(value);
            }
        });

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const result = await this.pool.query(
            `UPDATE admission SET ${fields.join(', ')} WHERE id_admission = $${paramCounter} RETURNING *`,
            values
        );
        return result.rows[0] || null;
    }

    async assignLit(idAdmission: number, idLit: number): Promise<boolean> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('UPDATE admission SET id_lit = $1 WHERE id_admission = $2', [idLit, idAdmission]);
            await client.query("UPDATE lit SET statut_lit = 'occupe' WHERE id_lit = $1", [idLit]);
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async cloturer(idAdmission: number): Promise<boolean> {
        const result = await this.pool.query(
            "UPDATE admission SET statut_admission = 'sortie' WHERE id_admission = $1",
            [idAdmission]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async generateNumAdmission(): Promise<string> {
        const year = new Date().getFullYear();
        const result = await this.pool.query(
            `SELECT num_admission FROM admission WHERE num_admission LIKE $1 ORDER BY num_admission DESC LIMIT 1`,
            [`A${year}%`]
        );
        if (result.rows.length === 0) return `A${year}0001`;
        const lastSequence = parseInt(result.rows[0].num_admission.slice(-4));
        return `A${year}${(lastSequence + 1).toString().padStart(4, '0')}`;
    }
}