import { Pool } from 'pg';
import type { Lit, CreateLitDTO, UpdateLitDTO, LitWithOccupation } from '../../domain/entities/Lit';

export class LitService {
  constructor(private pool: Pool) {}

  /**
   * Récupérer tous les lits avec leur occupation
   */
  async getAllLitsWithOccupation(): Promise<LitWithOccupation[]> {
    const query = `
      SELECT 
        l.*,
        a.id_admission,
        a.id_patient,
        a.date_admission,
        a.motif_admission,
        p.nom_patient,
        p.prenom_patient,
        p.date_naissance,
        p.sexe_patient,
        EXTRACT(EPOCH FROM (NOW() - a.date_admission)) / 3600 AS duree_occupation_heures
      FROM lits l
      LEFT JOIN admissions a ON l.id_lit = a.id_lit AND a.statut = 'en_cours'
      LEFT JOIN patient p ON a.id_patient = p.id_patient
      ORDER BY l.numero_lit ASC
    `;

    const result = await this.pool.query(query);

    return result.rows.map(row => {
      const lit: LitWithOccupation = {
        id_lit: row.id_lit,
        numero_lit: row.numero_lit,
        categorie: row.categorie,
        statut: row.statut,
        etage: row.etage,
        batiment: row.batiment,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      // Ajouter les infos du patient si le lit est occupé
      if (row.id_patient) {
        const birthDate = new Date(row.date_naissance);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        lit.patient_actuel = {
          id_patient: row.id_patient,
          nom_patient: row.nom_patient,
          prenom_patient: row.prenom_patient,
          age,
          sexe_patient: row.sexe_patient,
          diagnostic: row.motif_admission,
          date_admission: row.date_admission,
          duree_occupation_heures: Math.floor(row.duree_occupation_heures || 0),
        };
      }

      return lit;
    });
  }

  /**
   * Récupérer un lit par ID
   */
  async getLitById(id: number): Promise<Lit | null> {
    const result = await this.pool.query(
      'SELECT * FROM lits WHERE id_lit = $1',
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Créer un nouveau lit
   */
  async createLit(data: CreateLitDTO): Promise<Lit> {
    const result = await this.pool.query(
      `INSERT INTO lits (numero_lit, categorie, statut, etage, batiment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.numero_lit,
        data.categorie,
        data.statut || 'disponible',
        data.etage || null,
        data.batiment || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Mettre à jour un lit
   */
  async updateLit(id: number, data: UpdateLitDTO): Promise<Lit | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.numero_lit !== undefined) {
      fields.push(`numero_lit = $${paramIndex++}`);
      values.push(data.numero_lit);
    }
    if (data.categorie !== undefined) {
      fields.push(`categorie = $${paramIndex++}`);
      values.push(data.categorie);
    }
    if (data.statut !== undefined) {
      fields.push(`statut = $${paramIndex++}`);
      values.push(data.statut);
    }
    if (data.etage !== undefined) {
      fields.push(`etage = $${paramIndex++}`);
      values.push(data.etage);
    }
    if (data.batiment !== undefined) {
      fields.push(`batiment = $${paramIndex++}`);
      values.push(data.batiment);
    }

    if (fields.length === 0) {
      return this.getLitById(id);
    }

    values.push(id);

    const result = await this.pool.query(
      `UPDATE lits SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id_lit = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Supprimer un lit
   */
  async deleteLit(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM lits WHERE id_lit = $1 RETURNING id_lit',
      [id]
    );

    return result.rowCount! > 0;
  }

  /**
   * Marquer un lit comme occupé
   */
  async marquerOccupe(id: number): Promise<Lit | null> {
    const result = await this.pool.query(
      `UPDATE lits SET statut = 'occupe' WHERE id_lit = $1 RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Libérer un lit
   */
  async libererLit(id: number): Promise<Lit | null> {
    const result = await this.pool.query(
      `UPDATE lits SET statut = 'disponible' WHERE id_lit = $1 RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Obtenir les statistiques des lits
   */
  async getStatistiques() {
    const query = `
      SELECT 
        categorie,
        COUNT(*) as total,
        COUNT(CASE WHEN statut = 'disponible' THEN 1 END) as disponibles,
        COUNT(CASE WHEN statut = 'occupe' THEN 1 END) as occupes,
        COUNT(CASE WHEN statut = 'maintenance' THEN 1 END) as maintenance,
        COUNT(CASE WHEN statut = 'reserve' THEN 1 END) as reserves
      FROM lits
      GROUP BY categorie
      ORDER BY categorie
    `;

    const result = await this.pool.query(query);

    return result.rows;
  }

  /**
   * Initialiser les 24 lits de CENHOSOA
   * - Catégorie 1: 5 lits (416, 418, 420, 422, 424)
   * - Catégorie 2: 8 lits (406, 408, 410, 412)
   * - Catégorie 3: 4 lits (402)
   * - USIC: 3 lits
   */
  async initialiserLitsCENHOSOA(): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Supprimer tous les lits existants
      await client.query('DELETE FROM lits');

      const lits: CreateLitDTO[] = [];

      // Catégorie 1 - 5 chambres individuelles (416, 418, 420, 422, 424)
      ['416', '418', '420', '422', '424'].forEach(chambre => {
        lits.push({
          numero_lit: `${chambre}-1`,
          categorie: '1',
          etage: '4',
          batiment: 'Principal',
        });
      });

      // Catégorie 2 - 4 chambres doubles (406, 408, 410, 412)
      ['406', '408', '410', '412'].forEach(chambre => {
        for (let i = 1; i <= 2; i++) {
          lits.push({
            numero_lit: `${chambre}-${i}`,
            categorie: '2',
            etage: '4',
            batiment: 'Principal',
          });
        }
      });

      // Catégorie 3 - 1 chambre quadruple (402)
      for (let i = 1; i <= 4; i++) {
        lits.push({
          numero_lit: `402-${i}`,
          categorie: '3',
          etage: '4',
          batiment: 'Principal',
        });
      }

      // USIC - 1 chambre avec 3 lits soins intensifs
      for (let i = 1; i <= 3; i++) {
        lits.push({
          numero_lit: `USIC-${i}`,
          categorie: 'USIC',
          etage: 'RDC',
          batiment: 'Principal',
        });
      }

      // Insérer tous les lits
      for (const lit of lits) {
        await client.query(
          `INSERT INTO lits (numero_lit, categorie, statut, etage, batiment)
           VALUES ($1, $2, 'disponible', $3, $4)`,
          [lit.numero_lit, lit.categorie, lit.etage, lit.batiment]
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