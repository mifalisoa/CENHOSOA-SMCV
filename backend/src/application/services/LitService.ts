// backend/src/application/services/LitService.ts

import { Pool } from 'pg';
import type { Lit, CreateLitDTO, UpdateLitDTO, LitWithOccupation } from '../../domain/entities/Lit';

export class LitService {
  constructor(private pool: Pool) {}

  async getAllLitsWithOccupation(): Promise<LitWithOccupation[]> {
    const result = await this.pool.query(`
      SELECT l.*,
             a.id_admission, a.id_patient, a.date_admission, a.motif_admission,
             p.nom_patient, p.prenom_patient, p.date_naissance, p.sexe_patient,
             EXTRACT(EPOCH FROM (NOW() - a.date_admission)) / 3600 AS duree_occupation_heures
      FROM lit l
      LEFT JOIN admission a ON l.id_lit = a.id_lit AND a.statut_admission = 'en_cours'
      LEFT JOIN patients  p ON a.id_patient = p.id_patient
      ORDER BY l.numero_lit ASC
    `);

    return result.rows.map(row => {
      const lit: LitWithOccupation = {
        id_lit:      row.id_lit,
        numero_lit:  row.numero_lit,
        categorie:   row.categorie,
        statut:      row.statut_lit,
        etage:       row.etage,
        chambre:     row.chambre,
        service_lit: row.service_lit,
        type_lit:    row.type_lit,
        actif_lit:   row.actif_lit,
      };
      if (row.id_patient) {
        const age = new Date().getFullYear() - new Date(row.date_naissance).getFullYear();
        lit.patient_actuel = {
          id_patient:              row.id_patient,
          nom_patient:             row.nom_patient,
          prenom_patient:          row.prenom_patient,
          age,
          sexe_patient:            row.sexe_patient,
          diagnostic:              row.motif_admission,
          date_admission:          row.date_admission,
          duree_occupation_heures: Math.floor(row.duree_occupation_heures || 0),
        };
      }
      return lit;
    });
  }

  async getLitById(id: number): Promise<Lit | null> {
    const result = await this.pool.query('SELECT * FROM lit WHERE id_lit = $1', [id]);
    if (!result.rows[0]) return null;
    const r = result.rows[0];
    return { ...r, statut: r.statut_lit };
  }

  async createLit(data: CreateLitDTO): Promise<Lit> {
    const result = await this.pool.query(
      `INSERT INTO lit (numero_lit, categorie, statut_lit, etage, chambre, service_lit, type_lit)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.numero_lit, data.categorie, data.statut ?? 'disponible',
       data.etage ?? null, data.chambre ?? null,
       data.service_lit ?? 'Cardiologie', data.type_lit ?? 'standard']
    );
    const r = result.rows[0];
    return { ...r, statut: r.statut_lit };
  }

  async updateLit(id: number, data: UpdateLitDTO): Promise<Lit | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.numero_lit  !== undefined) { fields.push(`numero_lit  = $${i++}`); values.push(data.numero_lit);  }
    if (data.categorie   !== undefined) { fields.push(`categorie   = $${i++}`); values.push(data.categorie);   }
    if (data.statut      !== undefined) { fields.push(`statut_lit  = $${i++}`); values.push(data.statut);      }
    if (data.etage       !== undefined) { fields.push(`etage       = $${i++}`); values.push(data.etage);       }
    if (data.chambre     !== undefined) { fields.push(`chambre     = $${i++}`); values.push(data.chambre);     }
    if (data.service_lit !== undefined) { fields.push(`service_lit = $${i++}`); values.push(data.service_lit); }
    if (data.type_lit    !== undefined) { fields.push(`type_lit    = $${i++}`); values.push(data.type_lit);    }
    if (fields.length === 0) return this.getLitById(id);
    values.push(id);
    const result = await this.pool.query(
      `UPDATE lit SET ${fields.join(', ')} WHERE id_lit = $${i} RETURNING *`, values
    );
    if (!result.rows[0]) return null;
    return { ...result.rows[0], statut: result.rows[0].statut_lit };
  }

  async deleteLit(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM lit WHERE id_lit = $1 RETURNING id_lit', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async marquerOccupe(id: number): Promise<Lit | null> {
    const result = await this.pool.query(
      `UPDATE lit SET statut_lit = 'occupe' WHERE id_lit = $1 RETURNING *`, [id]
    );
    if (!result.rows[0]) return null;
    return { ...result.rows[0], statut: result.rows[0].statut_lit };
  }

  async libererLit(id: number): Promise<Lit | null> {
    const result = await this.pool.query(
      `UPDATE lit SET statut_lit = 'disponible' WHERE id_lit = $1 RETURNING *`, [id]
    );
    if (!result.rows[0]) return null;
    return { ...result.rows[0], statut: result.rows[0].statut_lit };
  }

  async getStatistiques() {
    const result = await this.pool.query(`
      SELECT categorie,
             COUNT(*)                                               AS total,
             COUNT(CASE WHEN statut_lit = 'disponible'  THEN 1 END) AS disponibles,
             COUNT(CASE WHEN statut_lit = 'occupe'      THEN 1 END) AS occupes,
             COUNT(CASE WHEN statut_lit = 'maintenance' THEN 1 END) AS maintenance,
             COUNT(CASE WHEN statut_lit = 'reserve'     THEN 1 END) AS reserves
      FROM lit GROUP BY categorie ORDER BY categorie
    `);
    return result.rows;
  }

  async initialiserLitsCENHOSOA(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM lit');

      const lits: CreateLitDTO[] = [];
      ['416','418','420','422','424'].forEach(ch =>
        lits.push({ numero_lit: `${ch}-1`, chambre: ch, etage: 4, categorie: '1', type_lit: 'VIP', service_lit: 'Cardiologie' })
      );
      ['406','408','410','412'].forEach(ch => {
        for (let i = 1; i <= 2; i++)
          lits.push({ numero_lit: `${ch}-${i}`, chambre: ch, etage: 4, categorie: '2', type_lit: 'standard', service_lit: 'Cardiologie' });
      });
      for (let i = 1; i <= 4; i++)
        lits.push({ numero_lit: `402-${i}`, chambre: '402', etage: 4, categorie: '3', type_lit: 'standard', service_lit: 'Cardiologie' });
      for (let i = 1; i <= 3; i++)
        lits.push({ numero_lit: `USIC-${i}`, chambre: 'USIC', etage: 0, categorie: 'USIC', type_lit: 'soins_intensifs', service_lit: 'USIC' });

      for (const l of lits) {
        await client.query(
          `INSERT INTO lit (numero_lit, chambre, etage, service_lit, type_lit, statut_lit, categorie, actif_lit)
           VALUES ($1, $2, $3, $4, $5, 'disponible', $6, true)`,
          [l.numero_lit, l.chambre, l.etage, l.service_lit, l.type_lit, l.categorie]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}