import { Pool } from 'pg';
import { SoinInfirmier } from '../../../../domain/entities/SoinInfirmier';
import { ISoinInfirmierRepository } from '../../../../domain/repositories/ISoinInfirmierRepository';

export class PostgresSoinInfirmierRepository implements ISoinInfirmierRepository {
  constructor(private pool: Pool) {}

  async create(soin: Omit<SoinInfirmier, 'id_soin_infirmier' | 'created_at' | 'updated_at'>): Promise<SoinInfirmier> {
    const query = `
      INSERT INTO soins_infirmiers (
        id_patient, id_admission, date_soin, heure_soin,
        ecg, ecg_dii_long, injection_iv, injection_im, pse, pansement, autre_soins,
        realise_par, verifie
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `;

    const values = [
      soin.id_patient,
      soin.id_admission || null,
      soin.date_soin,
      soin.heure_soin,
      soin.ecg || null,
      soin.ecg_dii_long || null,
      soin.injection_iv || null,
      soin.injection_im || null,
      soin.pse || null,
      soin.pansement || null,
      soin.autre_soins || null,
      soin.realise_par,
      soin.verifie || false,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToSoin(result.rows[0]);
  }

  async findById(id: number): Promise<SoinInfirmier | null> {
    const query = 'SELECT * FROM soins_infirmiers WHERE id_soin_infirmier = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSoin(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<SoinInfirmier[]> {
    const query = `
      SELECT * FROM soins_infirmiers 
      WHERE id_patient = $1 
      ORDER BY date_soin DESC, heure_soin DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToSoin(row));
  }

  async findByAdmissionId(admissionId: number): Promise<SoinInfirmier[]> {
    const query = `
      SELECT * FROM soins_infirmiers 
      WHERE id_admission = $1 
      ORDER BY date_soin DESC, heure_soin DESC
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToSoin(row));
  }

  async update(id: number, soin: Partial<SoinInfirmier>): Promise<SoinInfirmier> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(soin).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_soin_infirmier' && key !== 'created_at' && key !== 'updated_at') {
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
      UPDATE soins_infirmiers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_soin_infirmier = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Soin infirmier non trouvé');
    }
    return this.mapRowToSoin(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM soins_infirmiers WHERE id_soin_infirmier = $1';
    await this.pool.query(query, [id]);
  }

  async verify(id: number): Promise<SoinInfirmier> {
    const query = `
      UPDATE soins_infirmiers 
      SET verifie = NOT verifie, updated_at = CURRENT_TIMESTAMP
      WHERE id_soin_infirmier = $1
      RETURNING *
    `;
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new Error('Soin infirmier non trouvé');
    }
    return this.mapRowToSoin(result.rows[0]);
  }

  private mapRowToSoin(row: any): SoinInfirmier {
    return {
      id_soin_infirmier: row.id_soin_infirmier,
      id_patient: row.id_patient,
      id_admission: row.id_admission,
      date_soin: row.date_soin,
      heure_soin: row.heure_soin,
      ecg: row.ecg,
      ecg_dii_long: row.ecg_dii_long,
      injection_iv: row.injection_iv,
      injection_im: row.injection_im,
      pse: row.pse,
      pansement: row.pansement,
      autre_soins: row.autre_soins,
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