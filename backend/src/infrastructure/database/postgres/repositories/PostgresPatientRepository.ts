// backend/src/infrastructure/database/postgres/repositories/PostgresPatientRepository.ts

import { Pool } from 'pg';
import { IPatientRepository } from '../../../../domain/repositories/IPatientRepository';
import { Patient, CreatePatientDTO, UpdatePatientDTO, PatientFilters } from '../../../../domain/entities/Patient';
import { PaginatedResponse, PaginationParams } from '../../../../shared/types';

export class PostgresPatientRepository implements IPatientRepository {
  constructor(private pool: Pool) {}

  async create(data: CreatePatientDTO): Promise<Patient> {
    const numDossier = await this.generateNumDossier();

    const result = await this.pool.query(
      `INSERT INTO patients (
        num_dossier, nom_patient, prenom_patient, date_naissance, sexe_patient,
        adresse_patient, tel_patient, assurance, statut_patient, medecin_traitant,
        id_medecin_traitant, lit
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        numDossier,
        data.nom_patient,
        data.prenom_patient,
        data.date_naissance,
        data.sexe_patient,
        data.adresse_patient,
        data.tel_patient          || null,
        data.assurance            || null,
        data.statut_patient       || 'externe',
        data.medecin_traitant,
        (data as any).id_medecin_traitant ?? null,
        data.lit                  || null,
      ]
    );
    console.log('✅ [Repository] Patient créé avec succès');
    return result.rows[0];
  }

  async findById(id: number): Promise<Patient | null> {
    const result = await this.pool.query('SELECT * FROM patients WHERE id_patient = $1', [id]);
    return result.rows[0] || null;
  }

  async findByNumDossier(numDossier: string): Promise<Patient | null> {
    const result = await this.pool.query('SELECT * FROM patients WHERE num_dossier = $1', [numDossier]);
    return result.rows[0] || null;
  }

  async findAll(params: PaginationParams, filters?: PatientFilters & { id_medecin_traitant?: number }): Promise<PaginatedResponse<Patient>> {
    const page   = params.page  || 1;
    const limit  = params.limit || 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (filters?.statut) {
      conditions.push(`statut_patient = $${paramIndex++}`);
      queryParams.push(filters.statut);
    }
    if (filters?.assurance) {
      conditions.push(`assurance = $${paramIndex++}`);
      queryParams.push(filters.assurance);
    }
    if (filters?.search) {
      conditions.push(`(
        LOWER(nom_patient)    LIKE LOWER($${paramIndex}) OR
        LOWER(prenom_patient) LIKE LOWER($${paramIndex}) OR
        LOWER(num_dossier)    LIKE LOWER($${paramIndex}) OR
        tel_patient           LIKE $${paramIndex}
      )`);
      queryParams.push(`%${filters.search}%`);
      paramIndex++;
    }
    if (filters?.id_medecin_traitant) {
      conditions.push(`id_medecin_traitant = $${paramIndex++}`);
      queryParams.push(filters.id_medecin_traitant);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM patients ${whereClause}`, queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await this.pool.query(
      `SELECT * FROM patients ${whereClause} ORDER BY date_enregistrement DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    return {
      data: dataResult.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByStatus(status: string, params: PaginationParams): Promise<PaginatedResponse<Patient>> {
    const page   = params.page  || 1;
    const limit  = params.limit || 10;
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query(
      'SELECT COUNT(*) FROM patients WHERE statut_patient = $1', [status]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await this.pool.query(
      'SELECT * FROM patients WHERE statut_patient = $1 ORDER BY date_enregistrement DESC LIMIT $2 OFFSET $3',
      [status, limit, offset]
    );

    return {
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async search(query: string): Promise<Patient[]> {
    const result = await this.pool.query(
      `SELECT * FROM patients
       WHERE LOWER(nom_patient)    LIKE LOWER($1)
          OR LOWER(prenom_patient) LIKE LOWER($1)
          OR LOWER(num_dossier)    LIKE LOWER($1)
          OR tel_patient           LIKE $1
       ORDER BY nom_patient, prenom_patient LIMIT 20`,
      [`%${query}%`]
    );
    return result.rows;
  }

  async update(id: number, data: UpdatePatientDTO): Promise<Patient | null> {
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
      `UPDATE patients SET ${fields.join(', ')} WHERE id_patient = $${paramCounter} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM patients WHERE id_patient = $1', [id]);
  }

  async getStats(): Promise<{ total: number; externes: number; hospitalises: number }> {
    const result = await this.pool.query(`
      SELECT COUNT(*) as total,
             COUNT(*) FILTER (WHERE statut_patient = 'externe')    as externes,
             COUNT(*) FILTER (WHERE statut_patient = 'hospitalise') as hospitalises
      FROM patients
    `);
    return {
      total:        parseInt(result.rows[0].total),
      externes:     parseInt(result.rows[0].externes),
      hospitalises: parseInt(result.rows[0].hospitalises),
    };
  }

  private async generateNumDossier(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await this.pool.query(
      'SELECT COUNT(*) FROM patients WHERE num_dossier LIKE $1', [`${year}%`]
    );
    const count = parseInt(result.rows[0].count) + 1;
    return `${year}${count.toString().padStart(5, '0')}`;
  }
}