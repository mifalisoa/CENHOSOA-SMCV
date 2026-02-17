import { Pool } from 'pg';
import { IRendezVousRepository } from '../../../../domain/repositories/IRendezVousRepository';
import { RendezVous, CreateRendezVousDTO, UpdateRendezVousDTO } from '../../../../domain/entities/RendezVous';
import { PaginatedResponse, PaginationParams } from '../../../../shared/types';

export class PostgresRendezVousRepository implements IRendezVousRepository {
    constructor(private pool: Pool) {}

    async create(data: CreateRendezVousDTO): Promise<RendezVous> {
        const query = `
            INSERT INTO rendez_vous (
                id_patient, id_docteur, date_rdv, heure_rdv, duree_estimee,
                type_rdv, motif_rdv, statut_rdv, salle, notes_rdv
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            data.id_patient,
            data.id_docteur,
            data.date_rdv,
            data.heure_rdv,
            data.duree_estimee || 30,
            data.type_rdv || null,
            data.motif_rdv,
            data.statut_rdv || 'planifié',
            data.salle || null,
            data.notes_rdv || null,
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<RendezVous | null> {
        const query = `
            SELECT r.*, 
                   p.nom_patient, p.prenom_patient,
                   u.nom_user as nom_docteur, u.prenom_user as prenom_docteur, u.specialite_user
            FROM rendez_vous r
            JOIN patient p ON r.id_patient = p.id_patient
            JOIN utilisateur u ON r.id_docteur = u.id_user
            WHERE r.id_rdv = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByPatient(idPatient: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const offset = (page - 1) * limit;

        const countQuery = 'SELECT COUNT(*) FROM rendez_vous WHERE id_patient = $1';
        const countResult = await this.pool.query(countQuery, [idPatient]);
        const total = parseInt(countResult.rows[0].count);

        const query = `
            SELECT r.*,
                   u.nom_user as nom_docteur, u.prenom_user as prenom_docteur, u.specialite_user
            FROM rendez_vous r
            JOIN utilisateur u ON r.id_docteur = u.id_user
            WHERE r.id_patient = $1
            ORDER BY r.date_rdv DESC, r.heure_rdv DESC
            LIMIT $2 OFFSET $3
        `;

        const result = await this.pool.query(query, [idPatient, limit, offset]);

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

    async findByDocteur(idDocteur: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const offset = (page - 1) * limit;

        const countQuery = 'SELECT COUNT(*) FROM rendez_vous WHERE id_docteur = $1';
        const countResult = await this.pool.query(countQuery, [idDocteur]);
        const total = parseInt(countResult.rows[0].count);

        const query = `
            SELECT r.*,
                   p.nom_patient, p.prenom_patient, p.num_dossier, p.tel_patient
            FROM rendez_vous r
            JOIN patient p ON r.id_patient = p.id_patient
            WHERE r.id_docteur = $1
            ORDER BY r.date_rdv DESC, r.heure_rdv DESC
            LIMIT $2 OFFSET $3
        `;

        const result = await this.pool.query(query, [idDocteur, limit, offset]);

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

    async findByDate(date: Date, idDocteur?: number): Promise<RendezVous[]> {
        let query = `
            SELECT r.*,
                   p.nom_patient, p.prenom_patient, p.num_dossier,
                   u.nom_user as nom_docteur, u.prenom_user as prenom_docteur
            FROM rendez_vous r
            JOIN patient p ON r.id_patient = p.id_patient
            JOIN utilisateur u ON r.id_docteur = u.id_user
            WHERE r.date_rdv = $1
        `;

        const values: any[] = [date];

        if (idDocteur) {
            query += ' AND r.id_docteur = $2';
            values.push(idDocteur);
        }

        query += ' ORDER BY r.heure_rdv ASC';

        const result = await this.pool.query(query, values);
        return result.rows;
    }

    async update(id: number, data: UpdateRendezVousDTO): Promise<RendezVous | null> {
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
            UPDATE rendez_vous
            SET ${fields.join(', ')}
            WHERE id_rdv = $${paramCounter}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async cancel(id: number, raison: string): Promise<boolean> {
        const query = `
            UPDATE rendez_vous
            SET statut_rdv = 'annulé',
                date_annulation = CURRENT_TIMESTAMP,
                raison_annulation = $1
            WHERE id_rdv = $2
        `;
        const result = await this.pool.query(query, [raison, id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async confirm(id: number): Promise<boolean> {
        const query = `
            UPDATE rendez_vous
            SET statut_rdv = 'confirmé'
            WHERE id_rdv = $1 AND statut_rdv = 'planifié'
        `;
        const result = await this.pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async complete(id: number): Promise<boolean> {
        const query = `
            UPDATE rendez_vous
            SET statut_rdv = 'terminé'
            WHERE id_rdv = $1 AND statut_rdv IN ('planifié', 'confirmé')
        `;
        const result = await this.pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    async checkAvailability(idDocteur: number, date: Date, heure: string): Promise<boolean> {
        const query = `
            SELECT EXISTS(
                SELECT 1 FROM rendez_vous
                WHERE id_docteur = $1
                  AND date_rdv = $2
                  AND heure_rdv = $3
                  AND statut_rdv NOT IN ('annulé', 'terminé')
            )
        `;
        const result = await this.pool.query(query, [idDocteur, date, heure]);
        return !result.rows[0].exists; // true = disponible, false = occupé
    }
}