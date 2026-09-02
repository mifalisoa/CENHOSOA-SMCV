import { Pool } from 'pg';
import { CompteRendu } from '../../../../domain/entities/CompteRendu';
import { ICompteRenduRepository } from '../../../../domain/repositories/ICompteRenduRepository';

export class PostgresCompteRenduRepository implements ICompteRenduRepository {
  constructor(private pool: Pool) {}

  async create(compteRendu: Omit<CompteRendu, 'id_compte_rendu' | 'created_at' | 'updated_at'>): Promise<CompteRendu> {
    const query = `
      INSERT INTO comptes_rendus (
        id_patient, id_admission, date_admission, date_sortie,
        contexte, resume_observation, examens_paracliniques, diagnostic,
        traitement_sortie, evolution, prochain_rdv, medecin, cree_par_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `;

    const values = [
      compteRendu.id_patient,
      compteRendu.id_admission,
      compteRendu.date_admission,
      compteRendu.date_sortie,
      compteRendu.contexte || null,
      compteRendu.resume_observation,
      compteRendu.examens_paracliniques || null,
      compteRendu.diagnostic,
      compteRendu.traitement_sortie,
      compteRendu.evolution || null,
      compteRendu.prochain_rdv || null,
      compteRendu.medecin,
      compteRendu.cree_par_id || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToCompteRendu(result.rows[0]);
  }

  async findById(id: number): Promise<CompteRendu | null> {
    const query = 'SELECT * FROM comptes_rendus WHERE id_compte_rendu = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToCompteRendu(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<CompteRendu[]> {
    const query = `
      SELECT * FROM comptes_rendus 
      WHERE id_patient = $1 
      ORDER BY date_sortie DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToCompteRendu(row));
  }

  async findByAdmissionId(admissionId: number): Promise<CompteRendu | null> {
    const query = 'SELECT * FROM comptes_rendus WHERE id_admission = $1';
    const result = await this.pool.query(query, [admissionId]);
    return result.rows[0] ? this.mapRowToCompteRendu(result.rows[0]) : null;
  }

  async update(id: number, compteRendu: Partial<CompteRendu>): Promise<CompteRendu> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(compteRendu).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_compte_rendu' && key !== 'created_at' && key !== 'updated_at') {
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
      UPDATE comptes_rendus 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_compte_rendu = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Compte rendu non trouvé');
    }
    return this.mapRowToCompteRendu(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM comptes_rendus WHERE id_compte_rendu = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToCompteRendu(row: any): CompteRendu {
    return {
      id_compte_rendu: row.id_compte_rendu,
      id_patient: row.id_patient,
      id_admission: row.id_admission,
      date_admission: row.date_admission,
      date_sortie: row.date_sortie,
      contexte: row.contexte,
      resume_observation: row.resume_observation,
      examens_paracliniques: row.examens_paracliniques,
      diagnostic: row.diagnostic,
      traitement_sortie: row.traitement_sortie,
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