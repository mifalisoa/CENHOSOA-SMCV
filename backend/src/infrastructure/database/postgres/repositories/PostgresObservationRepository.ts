import { Pool } from 'pg';
import { Observation } from '../../../../domain/entities/Observation';
import { IObservationRepository } from '../../../../domain/repositories/IObservationRepository';

export class PostgresObservationRepository implements IObservationRepository {
  constructor(private pool: Pool) {}

  async create(observation: Omit<Observation, 'id_observation' | 'created_at' | 'updated_at'>): Promise<Observation> {
    const query = `
      INSERT INTO observations (
        id_patient, id_admission, type_observation, date_observation, heure_observation,
        motif_consultation, motif_hospitalisation,
        date_entree, diagnostic_entree, date_transeat, date_sortie, diagnostic_sortie,
        histoire_maladie,
        antecedents_cmo, antecedents_gmo, antecedents_che,
        examen_general, examen_physique_central, examen_physique_peripherique,
        resume_syndromique, hypotheses_diagnostiques, cat,
        resultats_examens_paracliniques, diagnostic_retenu, evolution_quotidienne,
        medecin
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING *
    `;

    const values = [
      observation.id_patient,
      observation.id_admission || null,
      observation.type_observation,
      observation.date_observation,
      observation.heure_observation,
      observation.motif_consultation || null,
      observation.motif_hospitalisation || null,
      observation.date_entree || null,
      observation.diagnostic_entree || null,
      observation.date_transeat || null,
      observation.date_sortie || null,
      observation.diagnostic_sortie || null,
      observation.histoire_maladie || null,
      JSON.stringify(observation.antecedents_cmo || null),
      JSON.stringify(observation.antecedents_gmo || null),
      JSON.stringify(observation.antecedents_che || null),
      JSON.stringify(observation.examen_general || null),
      JSON.stringify(observation.examen_physique_central || null),
      JSON.stringify(observation.examen_physique_peripherique || null),
      observation.resume_syndromique || null,
      observation.hypotheses_diagnostiques || null,
      observation.cat || null,
      observation.resultats_examens_paracliniques || null,
      observation.diagnostic_retenu || null,
      observation.evolution_quotidienne || null,
      observation.medecin,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToObservation(result.rows[0]);
  }

  async findById(id: number): Promise<Observation | null> {
    const query = 'SELECT * FROM observations WHERE id_observation = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToObservation(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number, type?: 'externe' | 'hospitalise'): Promise<Observation[]> {
    let query = 'SELECT * FROM observations WHERE id_patient = $1';
    const params: any[] = [patientId];

    if (type) {
      query += ' AND type_observation = $2';
      params.push(type);
    }

    query += ' ORDER BY date_observation DESC, heure_observation DESC';

    const result = await this.pool.query(query, params);
    return result.rows.map(row => this.mapRowToObservation(row));
  }

  async findByAdmissionId(admissionId: number): Promise<Observation[]> {
    const query = `
      SELECT * FROM observations 
      WHERE id_admission = $1 
      ORDER BY date_observation DESC, heure_observation DESC
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToObservation(row));
  }

  async update(id: number, observation: Partial<Observation>): Promise<Observation> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(observation).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_observation' && key !== 'created_at' && key !== 'updated_at') {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Aucun champ à mettre à jour');
    }

    values.push(id);

    const query = `
      UPDATE observations 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_observation = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Observation non trouvée');
    }
    return this.mapRowToObservation(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM observations WHERE id_observation = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToObservation(row: any): Observation {
    return {
      id_observation: row.id_observation,
      id_patient: row.id_patient,
      id_admission: row.id_admission,
      type_observation: row.type_observation,
      date_observation: row.date_observation,
      heure_observation: row.heure_observation,
      motif_consultation: row.motif_consultation,
      motif_hospitalisation: row.motif_hospitalisation,
      date_entree: row.date_entree,
      diagnostic_entree: row.diagnostic_entree,
      date_transeat: row.date_transeat,
      date_sortie: row.date_sortie,
      diagnostic_sortie: row.diagnostic_sortie,
      histoire_maladie: row.histoire_maladie,
      antecedents_cmo: row.antecedents_cmo,
      antecedents_gmo: row.antecedents_gmo,
      antecedents_che: row.antecedents_che,
      examen_general: row.examen_general,
      examen_physique_central: row.examen_physique_central,
      examen_physique_peripherique: row.examen_physique_peripherique,
      resume_syndromique: row.resume_syndromique,
      hypotheses_diagnostiques: row.hypotheses_diagnostiques,
      cat: row.cat,
      resultats_examens_paracliniques: row.resultats_examens_paracliniques,
      diagnostic_retenu: row.diagnostic_retenu,
      evolution_quotidienne: row.evolution_quotidienne,
      medecin: row.medecin,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}