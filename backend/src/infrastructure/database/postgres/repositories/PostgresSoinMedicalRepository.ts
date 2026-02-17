import { Pool } from 'pg';
import { SoinMedical } from '../../../../domain/entities/SoinMedical';
import { ISoinMedicalRepository } from '../../../../domain/repositories/ISoinMedicalRepository';

export class PostgresSoinMedicalRepository implements ISoinMedicalRepository {
  constructor(private pool: Pool) {}

  async create(soin: Omit<SoinMedical, 'id_soin_medical' | 'created_at' | 'updated_at'>): Promise<SoinMedical> {
    const query = `
      INSERT INTO soins_medicaux (
        id_patient, id_admission, date_soin, heure_soin,
        ett, eto, autre,
        realise_par, verifie
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *
    `;

    const values = [
      soin.id_patient,
      soin.id_admission || null,
      soin.date_soin,
      soin.heure_soin,
      soin.ett || null,
      soin.eto || null,
      soin.autre || null,
      soin.realise_par,
      soin.verifie || false,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToSoin(result.rows[0]);
  }

  async findById(id: number): Promise<SoinMedical | null> {
    const query = 'SELECT * FROM soins_medicaux WHERE id_soin_medical = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSoin(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<SoinMedical[]> {
    const query = `
      SELECT * FROM soins_medicaux 
      WHERE id_patient = $1 
      ORDER BY date_soin DESC, heure_soin DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToSoin(row));
  }

  async findByAdmissionId(admissionId: number): Promise<SoinMedical[]> {
    const query = `
      SELECT * FROM soins_medicaux 
      WHERE id_admission = $1 
      ORDER BY date_soin DESC, heure_soin DESC
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToSoin(row));
  }

  async update(id: number, soin: Partial<SoinMedical>): Promise<SoinMedical> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(soin).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_soin_medical' && key !== 'created_at' && key !== 'updated_at') {
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
      UPDATE soins_medicaux 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_soin_medical = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Soin médical non trouvé');
    }
    return this.mapRowToSoin(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM soins_medicaux WHERE id_soin_medical = $1';
    await this.pool.query(query, [id]);
  }

  async verify(id: number): Promise<SoinMedical> {
    const query = `
      UPDATE soins_medicaux 
      SET verifie = NOT verifie, updated_at = CURRENT_TIMESTAMP
      WHERE id_soin_medical = $1
      RETURNING *
    `;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new Error('Soin médical non trouvé');
    }
    return this.mapRowToSoin(result.rows[0]);
  }

  private mapRowToSoin(row: any): SoinMedical {
    return {
      id_soin_medical: row.id_soin_medical,
      id_patient: row.id_patient,
      id_admission: row.id_admission,
      date_soin: row.date_soin,
      heure_soin: row.heure_soin,
      ett: row.ett,
      eto: row.eto,
      autre: row.autre,
      realise_par: row.realise_par,
      verifie: row.verifie,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}