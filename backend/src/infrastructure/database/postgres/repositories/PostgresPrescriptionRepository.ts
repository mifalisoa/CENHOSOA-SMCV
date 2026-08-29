// backend/src/infrastructure/database/postgres/repositories/PostgresPrescriptionRepository.ts

import { Pool } from 'pg';
import { IPrescriptionRepository } from '../../../../domain/repositories/IPrescriptionRepository';
import { Prescription, CreatePrescriptionDTO, UpdatePrescriptionDTO, StatutPrescription } from '../../../../domain/entities/Prescription';

export class PostgresPrescriptionRepository implements IPrescriptionRepository {
    constructor(private pool: Pool) {}

    async create(data: CreatePrescriptionDTO & { statut: StatutPrescription }): Promise<Prescription> {

    
        const query = `
            INSERT INTO prescription (
                id_admission, id_docteur, type_prescription, nom_medicament, dosage,
                voie_administration, frequence, duree_traitement, nom_bilan,
                indication_bilan, instructions, modifications_traitement,
                cree_par_id, statut
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const values = [
            data.id_admission,
            data.id_docteur,
            data.type_prescription,
            data.nom_medicament         || null,
            data.dosage                 || null,
            data.voie_administration    || null,
            data.frequence              || null,
            data.duree_traitement       || null,
            data.nom_bilan              || null,
            data.indication_bilan       || null,
            data.instructions           || null,
            data.modifications_traitement || null,
            data.cree_par_id            || null,
            data.statut                 || 'en_attente',
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<Prescription | null> {
        const query = `
            SELECT p.*,
                   u.nom   AS nom_docteur, u.prenom AS prenom_docteur,
                   v.nom   AS valideur_nom, v.prenom AS valideur_prenom,
                   a.num_admission
            FROM prescription p
            JOIN utilisateurs u ON p.id_docteur   = u.id_user
            LEFT JOIN utilisateurs v ON p.valide_par = v.id_user
            JOIN admission    a ON p.id_admission = a.id_admission
            WHERE p.id_prescription = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByAdmission(idAdmission: number): Promise<Prescription[]> {
        const query = `
            SELECT p.*,
                   u.nom AS nom_docteur, u.prenom AS prenom_docteur,
                   v.nom AS valideur_nom, v.prenom AS valideur_prenom
            FROM prescription p
            JOIN utilisateurs u ON p.id_docteur = u.id_user
            LEFT JOIN utilisateurs v ON p.valide_par = v.id_user
            WHERE p.id_admission = $1
            ORDER BY p.date_prescription DESC
        `;
        const result = await this.pool.query(query, [idAdmission]);
        return result.rows;
    }

    async findByType(idAdmission: number, type: string): Promise<Prescription[]> {
        const query = `
            SELECT p.*,
                   u.nom AS nom_docteur, u.prenom AS prenom_docteur,
                   v.nom AS valideur_nom, v.prenom AS valideur_prenom
            FROM prescription p
            JOIN utilisateurs u ON p.id_docteur = u.id_user
            LEFT JOIN utilisateurs v ON p.valide_par = v.id_user
            WHERE p.id_admission = $1 AND p.type_prescription = $2
            ORDER BY p.date_prescription DESC
        `;
        const result = await this.pool.query(query, [idAdmission, type]);
        return result.rows;
    }

    async update(id: number, data: UpdatePrescriptionDTO): Promise<Prescription | null> {
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
        const query = `
            UPDATE prescription
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id_prescription = $${paramCounter}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.pool.query(
            'DELETE FROM prescription WHERE id_prescription = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async valider(id: number, statut: StatutPrescription, validateurId: number, modeGarde: boolean): Promise<Prescription | null> {
        const query = `
            UPDATE prescription
            SET statut      = $1,
                valide_par  = $2,
                valide_le   = CURRENT_TIMESTAMP,
                mode_garde  = $3,
                updated_at  = CURRENT_TIMESTAMP
            WHERE id_prescription = $4
            RETURNING *
        `;
        const values = [statut, validateurId || null, modeGarde, id];
        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    
}