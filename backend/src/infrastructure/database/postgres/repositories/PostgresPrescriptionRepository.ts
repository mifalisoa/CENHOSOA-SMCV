import { Pool } from 'pg';
import { IPrescriptionRepository } from '../../../../domain/repositories/IPrescriptionRepository';
import { Prescription, CreatePrescriptionDTO, UpdatePrescriptionDTO } from '../../../../domain/entities/Prescription';

export class PostgresPrescriptionRepository implements IPrescriptionRepository {
    constructor(private pool: Pool) {}

    async create(data: CreatePrescriptionDTO): Promise<Prescription> {
        const query = `
            INSERT INTO prescription (
                id_admission, id_docteur, type_prescription, nom_medicament, dosage,
                voie_administration, frequence, duree_traitement, nom_bilan,
                indication_bilan, instructions, modifications_traitement
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const values = [
            data.id_admission,
            data.id_docteur,
            data.type_prescription,
            data.nom_medicament || null,
            data.dosage || null,
            data.voie_administration || null,
            data.frequence || null,
            data.duree_traitement || null,
            data.nom_bilan || null,
            data.indication_bilan || null,
            data.instructions || null,
            data.modifications_traitement || null,
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async findById(id: number): Promise<Prescription | null> {
        const query = `
            SELECT p.*,
                   u.nom_user as nom_docteur, u.prenom_user as prenom_docteur,
                   a.num_admission
            FROM prescription p
            JOIN utilisateur u ON p.id_docteur = u.id_user
            JOIN admission a ON p.id_admission = a.id_admission
            WHERE p.id_prescription = $1
        `;
        const result = await this.pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async findByAdmission(idAdmission: number): Promise<Prescription[]> {
        const query = `
            SELECT p.*,
                   u.nom_user as nom_docteur, u.prenom_user as prenom_docteur
            FROM prescription p
            JOIN utilisateur u ON p.id_docteur = u.id_user
            WHERE p.id_admission = $1
            ORDER BY p.date_prescription DESC
        `;
        const result = await this.pool.query(query, [idAdmission]);
        return result.rows;
    }

    async findByType(idAdmission: number, type: string): Promise<Prescription[]> {
        const query = `
            SELECT p.*,
                   u.nom_user as nom_docteur, u.prenom_user as prenom_docteur
            FROM prescription p
            JOIN utilisateur u ON p.id_docteur = u.id_user
            WHERE p.id_admission = $1 AND p.type_prescription = $2
            ORDER BY p.date_prescription DESC
        `;
        const result = await this.pool.query(query, [idAdmission, type]);
        return result.rows;
    }

    async update(id: number, data: UpdatePrescriptionDTO): Promise<Prescription | null> {
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
            UPDATE prescription
            SET ${fields.join(', ')}
            WHERE id_prescription = $${paramCounter}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {
        const query = 'DELETE FROM prescription WHERE id_prescription = $1';
        const result = await this.pool.query(query, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}