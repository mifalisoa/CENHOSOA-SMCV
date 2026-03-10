// backend/src/application/services/PatientTransferService.ts

import { Pool } from 'pg';
import type { Patient } from '../../domain/entities/Patient';

export interface HospitalisationData {
  id_patient: number;
  motif_hospitalisation: string;
  service_hospitalisation: string;
  id_lit?: number;
  date_admission?: string; // ISO date
}

export interface SortieData {
  id_admission: number;
  motif_sortie: string;
  date_sortie?: string; // ISO date
}

export class PatientTransferService {
  constructor(private pool: Pool) {}

  /**
   * Transférer un patient EXTERNE → HOSPITALISÉ
   * Crée une admission et change le statut
   */
  async hospitaliserPatient(data: HospitalisationData): Promise<Patient> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Vérifier que le patient existe et est externe
      const patientCheck = await client.query(
        'SELECT * FROM patient WHERE id_patient = $1',
        [data.id_patient]
      );

      if (patientCheck.rows.length === 0) {
        throw new Error('Patient non trouvé');
      }

      const patient = patientCheck.rows[0];

      if (patient.statut_patient === 'hospitalisé' || patient.statut_patient === 'hospitalise') {
        throw new Error('Le patient est déjà hospitalisé');
      }

      // 2. Créer l'admission
      const dateAdmission = data.date_admission || new Date().toISOString();
      
      // Note: id_medecin est requis. On utilise 1 par défaut (à ajuster selon votre logique)
      const idMedecin = 1; // TODO: Récupérer l'ID du médecin connecté
      
      const admissionResult = await client.query(
        `INSERT INTO admissions 
         (id_patient, id_medecin, date_admission, motif_admission, diagnostic_admission, id_lit, statut) 
         VALUES ($1, $2, $3, $4, $5, $6, 'en_cours') 
         RETURNING *`,
        [
          data.id_patient,
          idMedecin,
          dateAdmission,
          data.motif_hospitalisation,
          data.service_hospitalisation, // Utilisé comme diagnostic_admission
          data.id_lit || null
        ]
      );

      const admission = admissionResult.rows[0];

      // 3. Si un lit est assigné, le marquer comme occupé
      if (data.id_lit) {
        await client.query(
          `UPDATE lit SET statut_lit = 'occupé', id_patient_actuel = $1 WHERE id_lit = $2`,
          [data.id_patient, data.id_lit]
        );
      }

      // 4. Changer le statut du patient
      const updatedPatient = await client.query(
        `UPDATE patient SET statut_patient = 'hospitalise' WHERE id_patient = $1 RETURNING *`,
        [data.id_patient]
      );

      await client.query('COMMIT');

      console.log(`✅ Patient ${patient.nom_patient} ${patient.prenom_patient} hospitalisé (admission ${admission.id_admission})`);

      return updatedPatient.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur hospitalisation:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Transférer un patient HOSPITALISÉ → EXTERNE
   * Clôture l'admission et change le statut
   */
  async rendrePatientExterne(data: SortieData): Promise<Patient> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Vérifier que l'admission existe et est active
      const admissionCheck = await client.query(
        'SELECT * FROM admissions WHERE id_admission = $1',
        [data.id_admission]
      );

      if (admissionCheck.rows.length === 0) {
        throw new Error('Admission non trouvée');
      }

      const admission = admissionCheck.rows[0];

      if (admission.statut === 'termine') {
        throw new Error('Cette admission est déjà terminée');
      }

      // 2. Récupérer le patient
      const patientResult = await client.query(
        'SELECT * FROM patient WHERE id_patient = $1',
        [admission.id_patient]
      );

      if (patientResult.rows.length === 0) {
        throw new Error('Patient non trouvé');
      }

      const patient = patientResult.rows[0];

      // 3. Clôturer l'admission
      const dateSortie = data.date_sortie || new Date().toISOString();

      await client.query(
        `UPDATE admissions 
         SET date_sortie_reelle = $1, notes = $2, statut = 'termine' 
         WHERE id_admission = $3`,
        [dateSortie, data.motif_sortie, data.id_admission]
      );

      // 4. Libérer le lit si un lit était assigné
      if (admission.id_lit) {
        await client.query(
          `UPDATE lit SET statut_lit = 'disponible', id_patient_actuel = NULL WHERE id_lit = $1`,
          [admission.id_lit]
        );
      }

      // 5. Changer le statut du patient en externe
      const updatedPatient = await client.query(
        `UPDATE patient SET statut_patient = 'externe' WHERE id_patient = $1 RETURNING *`,
        [admission.id_patient]
      );

      await client.query('COMMIT');

      console.log(`✅ Patient ${patient.nom_patient} ${patient.prenom_patient} rendu externe (sortie admission ${data.id_admission})`);

      return updatedPatient.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur sortie hospitalisation:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Récupérer l'admission active d'un patient hospitalisé
   */
  async getAdmissionActive(patientId: number) {
    const result = await this.pool.query(
      `SELECT * FROM admissions 
       WHERE id_patient = $1 AND statut = 'en_cours' 
       ORDER BY date_admission DESC 
       LIMIT 1`,
      [patientId]
    );

    return result.rows[0] || null;
  }
}