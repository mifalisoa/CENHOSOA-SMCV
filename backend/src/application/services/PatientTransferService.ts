// backend/src/application/services/PatientTransferService.ts

import { Pool } from 'pg';
import type { Patient } from '../../domain/entities/Patient';

export interface HospitalisationData {
  id_patient: number;
  motif_hospitalisation: string;
  service_hospitalisation: string;
  id_lit?: number;
  date_admission?: string;
  type_admission?: 'urgence' | 'programmee' | 'transfert';
}

export interface SortieData {
  id_admission: number;
  motif_sortie: string;
  date_sortie?: string;
}

export class PatientTransferService {
  constructor(private pool: Pool) {}

  private async generateNumAdmission(client: { query: (q: string, p?: unknown[]) => Promise<{ rows: Record<string, string>[] }> }): Promise<string> {
    const year = new Date().getFullYear();
    const result = await client.query(
      `SELECT num_admission FROM admission WHERE num_admission LIKE $1 ORDER BY num_admission DESC LIMIT 1`,
      [`A${year}%`]
    );
    if (result.rows.length === 0) return `A${year}0001`;
    const lastSequence = parseInt(result.rows[0].num_admission.slice(-4));
    return `A${year}${(lastSequence + 1).toString().padStart(4, '0')}`;
  }

  async hospitaliserPatient(data: HospitalisationData): Promise<Patient> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const patientCheck = await client.query(
        'SELECT * FROM patients WHERE id_patient = $1', [data.id_patient]
      );
      if (patientCheck.rows.length === 0) throw new Error('Patient non trouvé');
      const patient = patientCheck.rows[0];

      const admissionActive = await client.query(
        `SELECT * FROM admission WHERE id_patient = $1 AND statut_admission = 'en_cours'`,
        [data.id_patient]
      );
      if (admissionActive.rows.length > 0) throw new Error('Le patient a déjà une admission active en cours');

      const numAdmission  = await this.generateNumAdmission(client as never);
      const typeAdmission = data.type_admission || 'programmee';
      const dateAdmission = data.date_admission || new Date().toISOString();
      const idMedecin     = 1;

      const admissionResult = await client.query(
        `INSERT INTO admission
         (id_patient, id_docteur, num_admission, date_admission,
          motif_admission, diagnostic_entree, type_admission, statut_admission, id_lit)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'en_cours', $8)
         RETURNING *`,
        [data.id_patient, idMedecin, numAdmission, dateAdmission,
         data.motif_hospitalisation, data.service_hospitalisation,
         typeAdmission, data.id_lit || null]
      );
      const admission = admissionResult.rows[0];

      if (data.id_lit) {
        await client.query(
          `UPDATE lit SET statut_lit = 'occupe' WHERE id_lit = $1`, [data.id_lit]
        );
      }

      const updatedPatient = await client.query(
        `UPDATE patients SET statut_patient = 'hospitalise' WHERE id_patient = $1 RETURNING *`,
        [data.id_patient]
      );

      await client.query('COMMIT');
      console.log(`✅ Patient ${patient.nom_patient} hospitalisé (admission ${admission.num_admission})`);
      return updatedPatient.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rendrePatientExterne(data: SortieData): Promise<Patient> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const admissionCheck = await client.query(
        'SELECT * FROM admission WHERE id_admission = $1', [data.id_admission]
      );
      if (admissionCheck.rows.length === 0) throw new Error('Admission non trouvée');
      const admission = admissionCheck.rows[0];
      if (admission.statut_admission === 'sortie') throw new Error('Cette admission est déjà terminée');

      const patientResult = await client.query(
        'SELECT * FROM patients WHERE id_patient = $1', [admission.id_patient]
      );
      if (patientResult.rows.length === 0) throw new Error('Patient non trouvé');
      const patient = patientResult.rows[0];

      const dateSortie = data.date_sortie || new Date().toISOString().split('T')[0];
      await client.query(
        `UPDATE admission SET date_sortie_prevue = $1, remarques_admission = $2, statut_admission = 'sortie'
         WHERE id_admission = $3`,
        [dateSortie, data.motif_sortie, data.id_admission]
      );

      if (admission.id_lit) {
        await client.query(
          `UPDATE lit SET statut_lit = 'disponible' WHERE id_lit = $1`, [admission.id_lit]
        );
      }

      const updatedPatient = await client.query(
        `UPDATE patients SET statut_patient = 'externe' WHERE id_patient = $1 RETURNING *`,
        [admission.id_patient]
      );

      await client.query('COMMIT');
      console.log(`✅ Patient ${patient.nom_patient} rendu externe`);
      return updatedPatient.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAdmissionActive(patientId: number) {
    const result = await this.pool.query(
      `SELECT * FROM admission WHERE id_patient = $1 AND statut_admission = 'en_cours'
       ORDER BY date_admission DESC LIMIT 1`,
      [patientId]
    );
    return result.rows[0] || null;
  }
}