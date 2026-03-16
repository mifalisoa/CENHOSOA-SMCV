// backend/src/infrastructure/database/postgres/repositories/PostgresRendezVousRepository.ts

import { Pool } from 'pg';
import type {
  RendezVous,
  CreateRendezVousDTO,
  UpdateRendezVousDTO,
  RendezVousWithDetails
} from '../../../../domain/entities/RendezVous';
import type { IRendezVousRepository } from '../../../../domain/repositories/IRendezVousRepository';
import type { PaginatedResponse, PaginationParams } from '../../../../shared/types';

export class PostgresRendezVousRepository implements IRendezVousRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateRendezVousDTO): Promise<RendezVous> {
    const result = await this.pool.query(
      `INSERT INTO rendez_vous
       (id_patient, id_docteur, date_rdv, heure_rdv, duree_estimee, type_rdv, motif_rdv, statut_rdv, salle, notes_rdv)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.id_patient,
        data.id_docteur,
        data.date_rdv,
        data.heure_rdv,
        data.duree_estimee || 30,
        data.type_rdv      || 'consultation',
        data.motif_rdv,
        data.statut_rdv    || 'planifie',
        data.salle         || null,
        data.notes_rdv     || null,
      ]
    );
    return result.rows[0];
  }

  async findById(id: number): Promise<RendezVous | null> {
    const result = await this.pool.query(
      'SELECT * FROM rendez_vous WHERE id_rdv = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByPatient(idPatient: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;
    const countResult = await this.pool.query(
      'SELECT COUNT(*) FROM rendez_vous WHERE id_patient = $1',
      [idPatient]
    );
    const total = parseInt(countResult.rows[0].count);
    const result = await this.pool.query(
      `SELECT * FROM rendez_vous
       WHERE id_patient = $1
       ORDER BY date_rdv DESC, heure_rdv DESC
       LIMIT $2 OFFSET $3`,
      [idPatient, limit, offset]
    );
    return { data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findByDocteur(idDocteur: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;
    const countResult = await this.pool.query(
      'SELECT COUNT(*) FROM rendez_vous WHERE id_docteur = $1',
      [idDocteur]
    );
    const total = parseInt(countResult.rows[0].count);
    const result = await this.pool.query(
      `SELECT * FROM rendez_vous
       WHERE id_docteur = $1
       ORDER BY date_rdv DESC, heure_rdv DESC
       LIMIT $2 OFFSET $3`,
      [idDocteur, limit, offset]
    );
    return { data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findByDate(date: Date, idDocteur?: number): Promise<RendezVous[]> {
    const dateStr = date.toISOString().split('T')[0];
    if (idDocteur) {
      const result = await this.pool.query(
        `SELECT * FROM rendez_vous WHERE date_rdv = $1 AND id_docteur = $2 ORDER BY heure_rdv ASC`,
        [dateStr, idDocteur]
      );
      return result.rows;
    }
    const result = await this.pool.query(
      `SELECT * FROM rendez_vous WHERE date_rdv = $1 ORDER BY heure_rdv ASC`,
      [dateStr]
    );
    return result.rows;
  }

  async findByPeriod(dateDebut: Date, dateFin: Date): Promise<RendezVous[]> {
    const result = await this.pool.query(
      `SELECT * FROM rendez_vous
       WHERE date_rdv BETWEEN $1 AND $2
       ORDER BY date_rdv ASC, heure_rdv ASC`,
      [dateDebut.toISOString().split('T')[0], dateFin.toISOString().split('T')[0]]
    );
    return result.rows;
  }

  async update(id: number, data: UpdateRendezVousDTO): Promise<RendezVous | null> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let i = 1;

    if (data.id_docteur         !== undefined) { fields.push(`id_docteur = $${i++}`);          values.push(data.id_docteur); }
    if (data.date_rdv           !== undefined) { fields.push(`date_rdv = $${i++}`);            values.push(data.date_rdv); }
    if (data.heure_rdv          !== undefined) { fields.push(`heure_rdv = $${i++}`);           values.push(data.heure_rdv); }
    if (data.duree_estimee      !== undefined) { fields.push(`duree_estimee = $${i++}`);       values.push(data.duree_estimee); }
    if (data.type_rdv           !== undefined) { fields.push(`type_rdv = $${i++}`);            values.push(data.type_rdv); }
    if (data.motif_rdv          !== undefined) { fields.push(`motif_rdv = $${i++}`);           values.push(data.motif_rdv); }
    if (data.statut_rdv         !== undefined) { fields.push(`statut_rdv = $${i++}`);          values.push(data.statut_rdv); }
    if (data.salle              !== undefined) { fields.push(`salle = $${i++}`);               values.push(data.salle); }
    if (data.notes_rdv          !== undefined) { fields.push(`notes_rdv = $${i++}`);           values.push(data.notes_rdv); }
    if (data.date_annulation    !== undefined) { fields.push(`date_annulation = $${i++}`);     values.push(data.date_annulation); }
    if (data.raison_annulation  !== undefined) { fields.push(`raison_annulation = $${i++}`);   values.push(data.raison_annulation); }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await this.pool.query(
      `UPDATE rendez_vous SET ${fields.join(', ')} WHERE id_rdv = $${i} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async cancel(id: number, raison: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE rendez_vous
       SET statut_rdv = 'annule', date_annulation = CURRENT_TIMESTAMP, raison_annulation = $2
       WHERE id_rdv = $1 RETURNING id_rdv`,
      [id, raison]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async confirm(id: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE rendez_vous SET statut_rdv = 'confirme' WHERE id_rdv = $1 RETURNING id_rdv`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async complete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE rendez_vous SET statut_rdv = 'termine' WHERE id_rdv = $1 RETURNING id_rdv`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async checkAvailability(idDocteur: number, date: Date, heure: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT id_rdv FROM rendez_vous WHERE id_docteur = $1 AND date_rdv = $2 AND heure_rdv = $3`,
      [idDocteur, date.toISOString().split('T')[0], heure]
    );
    return result.rows.length === 0;
  }

  async findAll(): Promise<RendezVousWithDetails[]> {
    const result = await this.pool.query(
      `SELECT
        r.*,
        p.nom_patient,
        p.prenom_patient,
        EXTRACT(YEAR FROM AGE(p.date_naissance)) AS patient_age,
        p.sexe_patient,
        u.nom        AS docteur_nom,
        u.prenom     AS docteur_prenom,
        u.specialite AS docteur_specialite
       FROM rendez_vous r
       LEFT JOIN patients     p ON r.id_patient = p.id_patient
       LEFT JOIN utilisateurs u ON r.id_docteur = u.id_user
       ORDER BY r.date_rdv DESC, r.heure_rdv DESC`
    );
    return result.rows;
  }

  async findByIdWithDetails(id: number): Promise<RendezVousWithDetails | null> {
    const result = await this.pool.query(
      `SELECT
        r.*,
        p.nom_patient,
        p.prenom_patient,
        EXTRACT(YEAR FROM AGE(p.date_naissance)) AS patient_age,
        p.sexe_patient,
        u.nom        AS docteur_nom,
        u.prenom     AS docteur_prenom,
        u.specialite AS docteur_specialite
       FROM rendez_vous r
       LEFT JOIN patients     p ON r.id_patient = p.id_patient
       LEFT JOIN utilisateurs u ON r.id_docteur = u.id_user
       WHERE r.id_rdv = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByDateWithDetails(date: string): Promise<RendezVousWithDetails[]> {
    const result = await this.pool.query(
      `SELECT
        r.*,
        p.nom_patient,
        p.prenom_patient,
        EXTRACT(YEAR FROM AGE(p.date_naissance)) AS patient_age,
        p.sexe_patient,
        u.nom        AS docteur_nom,
        u.prenom     AS docteur_prenom,
        u.specialite AS docteur_specialite
       FROM rendez_vous r
       LEFT JOIN patients     p ON r.id_patient = p.id_patient
       LEFT JOIN utilisateurs u ON r.id_docteur = u.id_user
       WHERE r.date_rdv = $1
       ORDER BY r.heure_rdv ASC`,
      [date]
    );
    return result.rows;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM rendez_vous WHERE id_rdv = $1 RETURNING id_rdv',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async checkConflict(docteurId: number, date: string, heure: string, excludeRdvId?: number): Promise<boolean> {
    const query = excludeRdvId
      ? `SELECT id_rdv FROM rendez_vous WHERE id_docteur = $1 AND date_rdv = $2 AND heure_rdv = $3 AND id_rdv != $4`
      : `SELECT id_rdv FROM rendez_vous WHERE id_docteur = $1 AND date_rdv = $2 AND heure_rdv = $3`;
    const params = excludeRdvId ? [docteurId, date, heure, excludeRdvId] : [docteurId, date, heure];
    const result = await this.pool.query(query, params);
    return result.rows.length > 0;
  }
}