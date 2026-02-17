import { Pool } from 'pg';
import { BilanBiologique } from '../../../../domain/entities/BilanBiologique';
import { IBilanBiologiqueRepository } from '../../../../domain/repositories/IBilanBiologiqueRepository';

export class PostgresBilanBiologiqueRepository implements IBilanBiologiqueRepository {
  constructor(private pool: Pool) {}

  async create(bilan: Omit<BilanBiologique, 'id_bilan' | 'created_at' | 'updated_at'>): Promise<BilanBiologique> {
    const query = `
      INSERT INTO bilans_biologiques (
        id_patient, id_admission, date_prelevement, heure_prelevement,
        creatinine, glycemie, crp, inr, nfs,
        type_bilan, resultat, interpretation,
        prescripteur, laboratoire
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `;

    const values = [
      bilan.id_patient,
      bilan.id_admission || null,
      bilan.date_prelevement,
      bilan.heure_prelevement,
      bilan.creatinine || null,
      bilan.glycemie || null,
      bilan.crp || null,
      bilan.inr || null,
      bilan.nfs || null,
      bilan.type_bilan || null,
      bilan.resultat || null,
      bilan.interpretation || null,
      bilan.prescripteur || null,
      bilan.laboratoire || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToBilan(result.rows[0]);
  }

  async findById(id: number): Promise<BilanBiologique | null> {
    const query = 'SELECT * FROM bilans_biologiques WHERE id_bilan = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToBilan(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<BilanBiologique[]> {
    const query = `
      SELECT * FROM bilans_biologiques 
      WHERE id_patient = $1 
      ORDER BY date_prelevement DESC, heure_prelevement DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToBilan(row));
  }

  async findByAdmissionId(admissionId: number): Promise<BilanBiologique[]> {
    const query = `
      SELECT * FROM bilans_biologiques 
      WHERE id_admission = $1 
      ORDER BY date_prelevement DESC, heure_prelevement DESC
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToBilan(row));
  }

  async update(id: number, bilan: Partial<BilanBiologique>): Promise<BilanBiologique> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(bilan).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_bilan' && key !== 'created_at' && key !== 'updated_at') {
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
      UPDATE bilans_biologiques 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_bilan = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Bilan biologique non trouvé');
    }
    return this.mapRowToBilan(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM bilans_biologiques WHERE id_bilan = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToBilan(row: any): BilanBiologique {
    return {
      id_bilan: row.id_bilan,
      id_patient: row.id_patient,
      id_admission: row.id_admission,
      date_prelevement: row.date_prelevement,
      heure_prelevement: row.heure_prelevement,
      creatinine: row.creatinine,
      glycemie: row.glycemie,
      crp: row.crp,
      inr: row.inr,
      nfs: row.nfs,
      type_bilan: row.type_bilan,
      resultat: row.resultat,
      interpretation: row.interpretation,
      prescripteur: row.prescripteur,
      laboratoire: row.laboratoire,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}