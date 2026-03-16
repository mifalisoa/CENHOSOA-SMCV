// backend/src/application/services/LitTransferService.ts

import { Pool } from 'pg';

export interface TransfertLitData {
  id_patient: number;
  ancien_lit: number;
  nouveau_lit: number;
  motif_transfert: string;
  date_transfert?: string;
}

export class LitTransferService {
  constructor(private pool: Pool) {}

  async transfererPatient(data: TransfertLitData): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const patientCheck = await client.query(
        'SELECT * FROM patients WHERE id_patient = $1', [data.id_patient]
      );
      if (patientCheck.rows.length === 0) throw new Error('Patient non trouvé');
      const patient = patientCheck.rows[0];
      if (patient.statut_patient !== 'hospitalise') throw new Error("Le patient n'est pas hospitalisé");

      const admissionCheck = await client.query(
        `SELECT * FROM admission WHERE id_patient = $1 AND statut_admission = 'en_cours'
         ORDER BY date_admission DESC LIMIT 1`,
        [data.id_patient]
      );
      if (admissionCheck.rows.length === 0) throw new Error('Aucune admission active trouvée pour ce patient');
      const admission = admissionCheck.rows[0];

      if (admission.id_lit !== data.ancien_lit) throw new Error(`Le patient n'est pas dans le lit ${data.ancien_lit}`);

      const nouveauLitCheck = await client.query('SELECT * FROM lit WHERE id_lit = $1', [data.nouveau_lit]);
      if (nouveauLitCheck.rows.length === 0) throw new Error("Le nouveau lit n'existe pas");
      const nouveauLit = nouveauLitCheck.rows[0];
      if (nouveauLit.statut_lit !== 'disponible') throw new Error(`Le lit ${nouveauLit.numero_lit} n'est pas disponible`);

      await client.query(`UPDATE lit SET statut_lit = 'disponible' WHERE id_lit = $1`, [data.ancien_lit]);
      await client.query(`UPDATE lit SET statut_lit = 'occupe' WHERE id_lit = $1`,     [data.nouveau_lit]);

      // Construire la note de transfert en JS avant de l'envoyer à PostgreSQL
      const dateTransfert = data.date_transfert || new Date().toISOString().split('T')[0];
      const noteTransfert = `\n[Transfert le ${dateTransfert}] Lit ${data.ancien_lit} → Lit ${data.nouveau_lit}. Motif: ${data.motif_transfert}`;

      await client.query(
        `UPDATE admission
         SET id_lit = $1,
             remarques_admission = COALESCE(remarques_admission, '') || $2::text
         WHERE id_admission = $3`,
        [data.nouveau_lit, noteTransfert, admission.id_admission]
      );

      try {
        await client.query(
          `INSERT INTO historique_transferts_lits
           (id_patient, id_admission, ancien_lit, nouveau_lit, motif, date_transfert, effectue_par)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [data.id_patient, admission.id_admission, data.ancien_lit, data.nouveau_lit,
           data.motif_transfert, data.date_transfert || new Date().toISOString(), 1]
        );
      } catch {
        console.log('Table historique_transferts_lits non trouvée');
      }

      await client.query('COMMIT');
      console.log(`✅ Patient ${patient.nom_patient} transféré du lit ${data.ancien_lit} au lit ${data.nouveau_lit}`);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getHistoriqueTransferts(patientId: number) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM historique_transferts_lits WHERE id_patient = $1 ORDER BY date_transfert DESC',
        [patientId]
      );
      return result.rows;
    } catch {
      return [];
    }
  }
}