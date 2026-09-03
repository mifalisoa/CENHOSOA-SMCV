import { Pool } from 'pg';
import { CompteRenduConsultation } from '../../../../domain/entities/CompteRenduConsultation';
import { ICompteRenduConsultationRepository } from '../../../../domain/repositories/ICompteRenduConsultationRepository';

export class PostgresCompteRenduConsultationRepository implements ICompteRenduConsultationRepository {
  constructor(private pool: Pool) {}

  async create(
    data: Omit<CompteRenduConsultation, 'id_compte_rendu_consultation' | 'created_at' | 'updated_at'>
  ): Promise<CompteRenduConsultation> {
    const query = `
      INSERT INTO comptes_rendus_consultation (
        id_patient, date_consultation, motif_consultation,
        contexte, examens_paracliniques, diagnostic, traitement,
        evolution, prochain_rdv, medecin, cree_par_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `;

    const values = [
      data.id_patient,
      data.date_consultation,
      data.motif_consultation,
      data.contexte || null,
      data.examens_paracliniques || null,
      data.diagnostic,
      data.traitement,
      data.evolution || null,
      data.prochain_rdv || null,
      data.medecin,
      data.cree_par_id || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToCompteRenduConsultation(result.rows[0]);
  }

  async findById(id: number): Promise<CompteRenduConsultation | null> {
    const query = 'SELECT * FROM comptes_rendus_consultation WHERE id_compte_rendu_consultation = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToCompteRenduConsultation(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<CompteRenduConsultation[]> {
    const query = `
      SELECT * FROM comptes_rendus_consultation
      WHERE id_patient = $1
      ORDER BY date_consultation DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToCompteRenduConsultation(row));
  }

  async update(id: number, data: Partial<CompteRenduConsultation>): Promise<CompteRenduConsultation> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_compte_rendu_consultation' && key !== 'created_at' && key !== 'updated_at') {
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
      UPDATE comptes_rendus_consultation
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_compte_rendu_consultation = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Compte rendu de consultation non trouvé');
    }
    return this.mapRowToCompteRenduConsultation(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM comptes_rendus_consultation WHERE id_compte_rendu_consultation = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToCompteRenduConsultation(row: any): CompteRenduConsultation {
    return {
      id_compte_rendu_consultation: row.id_compte_rendu_consultation,
      id_patient: row.id_patient,
      date_consultation: row.date_consultation,
      motif_consultation: row.motif_consultation,
      contexte: row.contexte,
      examens_paracliniques: row.examens_paracliniques,
      diagnostic: row.diagnostic,
      traitement: row.traitement,
      evolution: row.evolution,
      prochain_rdv: row.prochain_rdv,
      medecin: row.medecin,
      cree_par_id: row.cree_par_id,
      modifie_par_id: row.modifie_par_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}