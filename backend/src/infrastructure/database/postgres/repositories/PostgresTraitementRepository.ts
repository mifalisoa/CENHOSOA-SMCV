import { Pool } from 'pg';
import { Traitement } from '../../../../domain/entities/Traitement';
import { ITraitementRepository } from '../../../../domain/repositories/ITraitementRepository';

export class PostgresTraitementRepository implements ITraitementRepository {
  constructor(private pool: Pool) {}

  async create(traitement: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at'>): Promise<Traitement> {
    const query = `
      INSERT INTO traitements (
        id_patient, id_admission, date_prescription, heure_prescription,
        type_document, diagnostic, prescripteur, lieu_prescription,
        medicament, dosage, voie_administration, frequence, duree, instructions,
        observations_speciales
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *
    `;

    const values = [
      traitement.id_patient,
      traitement.id_admission || null,
      traitement.date_prescription,
      traitement.heure_prescription,
      traitement.type_document,
      traitement.diagnostic || null,
      traitement.prescripteur || null,
      traitement.lieu_prescription || null,
      traitement.medicament,
      traitement.dosage,
      traitement.voie_administration,
      traitement.frequence,
      traitement.duree,
      traitement.instructions || null,
      traitement.observations_speciales || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToTraitement(result.rows[0]);
  }

  async findById(id: number): Promise<Traitement | null> {
    const query = 'SELECT * FROM traitements WHERE id_traitement = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToTraitement(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<Traitement[]> {
    const query = `
      SELECT * FROM traitements 
      WHERE id_patient = $1 
      ORDER BY date_prescription DESC, heure_prescription DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToTraitement(row));
  }

  async findByAdmissionId(admissionId: number): Promise<Traitement[]> {
    const query = `
      SELECT * FROM traitements 
      WHERE id_admission = $1 
      ORDER BY date_prescription DESC, heure_prescription DESC
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToTraitement(row));
  }

  async update(id: number, traitement: Partial<Traitement>): Promise<Traitement> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(traitement).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_traitement' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('Aucun champ à mettre à jour');
    }

    values.push(id);

    const query = `
      UPDATE traitements 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_traitement = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Traitement non trouvé');
    }
    return this.mapRowToTraitement(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM traitements WHERE id_traitement = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToTraitement(row: any): Traitement {
    return {
      id_traitement: row.id_traitement,
      id_patient: row.id_patient,
      id_admission: row.id_admission,
      date_prescription: row.date_prescription,
      heure_prescription: row.heure_prescription,
      type_document: row.type_document,
      diagnostic: row.diagnostic,
      prescripteur: row.prescripteur,
      lieu_prescription: row.lieu_prescription,
      medicament: row.medicament,
      dosage: row.dosage,
      voie_administration: row.voie_administration,
      frequence: row.frequence,
      duree: row.duree,
      instructions: row.instructions,
      observations_speciales: row.observations_speciales,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}