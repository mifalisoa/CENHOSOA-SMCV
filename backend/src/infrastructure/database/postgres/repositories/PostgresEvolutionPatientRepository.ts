import { Pool } from 'pg';
import { EvolutionPatient } from '../../../../domain/entities/EvolutionPatient';
import { IEvolutionPatientRepository } from '../../../../domain/repositories/IEvolutionPatientRepository';
import { CreateEvolutionPatientDTO } from '../../../../domain/entities/EvolutionPatient';

export class PostgresEvolutionPatientRepository implements IEvolutionPatientRepository {
  constructor(private pool: Pool) {}

  async create(data: Omit<EvolutionPatient, 'id_evolution' | 'created_at' | 'updated_at'>): Promise<EvolutionPatient> {
    const query = `
      INSERT INTO evolution_patient (
        id_observation, id_patient,
        date_visite, heure_visite, medecin,
        resume_patient,
        parametres,
        examen_physique_central,
        examen_physique_peripherique,
        resultats_examens_paracliniques,
        traitement, problemes_poses, cat
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `;
    const values = [
      data.id_observation,
      data.id_patient,
      data.date_visite,
      data.heure_visite,
      data.medecin,
      data.resume_patient                      || null,
      JSON.stringify(data.parametres           || null),
      JSON.stringify(data.examen_physique_central      || null),
      JSON.stringify(data.examen_physique_peripherique || null),
      data.resultats_examens_paracliniques     || null,
      data.traitement                          || null,
      data.problemes_poses                     || null,
      data.cat                                 || null,
    ];
    const result = await this.pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  async findById(id: number): Promise<EvolutionPatient | null> {
    const result = await this.pool.query(
      'SELECT * FROM evolution_patient WHERE id_evolution = $1', [id]
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<EvolutionPatient[]> {
    const result = await this.pool.query(
      `SELECT * FROM evolution_patient
       WHERE id_patient = $1
       ORDER BY date_visite DESC, heure_visite DESC`,
      [patientId]
    );
    return result.rows.map(row => this.mapRow(row));
  }

  async findByObservationId(observationId: number): Promise<EvolutionPatient[]> {
    const result = await this.pool.query(
      `SELECT * FROM evolution_patient
       WHERE id_observation = $1
       ORDER BY date_visite DESC, heure_visite DESC`,
      [observationId]
    );
    return result.rows.map(row => this.mapRow(row));
  }

  async update(id: number, data: Partial<CreateEvolutionPatientDTO>): Promise<EvolutionPatient> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== 'id_evolution' &&
        key !== 'id_observation' &&
        key !== 'id_patient' &&
        key !== 'created_at' &&
        key !== 'updated_at'
      ) {
        if (typeof value === 'object' && value !== null) {
          fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) throw new Error('Aucun champ à mettre à jour');

    values.push(id);
    const result = await this.pool.query(
      `UPDATE evolution_patient
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id_evolution = $${paramCount}
       RETURNING *`,
      values
    );
    if (result.rows.length === 0) throw new Error('Évolution non trouvée');
    return this.mapRow(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM evolution_patient WHERE id_evolution = $1', [id]);
  }

  private mapRow(row: Record<string, unknown>): EvolutionPatient {
    return {
      id_evolution:                    row.id_evolution                    as number,
      id_observation:                  row.id_observation                  as number,
      id_patient:                      row.id_patient                      as number,
      date_visite:                     row.date_visite                     as Date,
      heure_visite:                    row.heure_visite                    as string,
      medecin:                         row.medecin                         as string,
      resume_patient:                  row.resume_patient                  as string | undefined,
      parametres:                      row.parametres                      as EvolutionPatient['parametres'],
      examen_physique_central:         row.examen_physique_central         as EvolutionPatient['examen_physique_central'],
      examen_physique_peripherique:    row.examen_physique_peripherique    as EvolutionPatient['examen_physique_peripherique'],
      resultats_examens_paracliniques: row.resultats_examens_paracliniques as string | undefined,
      traitement:                      row.traitement                      as string | undefined,
      problemes_poses:                 row.problemes_poses                 as string | undefined,
      cat:                             row.cat                             as string | undefined,
      created_at:                      row.created_at                      as Date,
      updated_at:                      row.updated_at                      as Date,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}