import { Pool } from 'pg';
import { SoinInfirmier } from '../../../../domain/entities/SoinInfirmier';
import { ISoinInfirmierRepository } from '../../../../domain/repositories/ISoinInfirmierRepository';
import { StatutValidation } from '../../../../shared/types';

export class PostgresSoinInfirmierRepository implements ISoinInfirmierRepository {
  constructor(private pool: Pool) {}

  async create(soin: Omit<SoinInfirmier, 'id_soin_infirmier' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde'>): Promise<SoinInfirmier> {
    const query = `
      INSERT INTO soins_infirmiers (
        id_patient, id_admission, date_soin, heure_soin,
        ecg, ecg_dii_long, injection_iv, injection_im, pse, pansement, autre_soins,
        realise_par, cree_par_id,
        verifie, statut, mode_garde
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false, 'en_attente', false
      ) RETURNING *
    `;

    const values = [
      soin.id_patient,
      soin.id_admission  || null,
      soin.date_soin,
      soin.heure_soin,
      soin.ecg           || null,
      soin.ecg_dii_long  || null,
      soin.injection_iv  || null,
      soin.injection_im  || null,
      soin.pse           || null,
      soin.pansement     || null,
      soin.autre_soins   || null,
      soin.realise_par,
      soin.cree_par_id   || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToSoin(result.rows[0]);
  }

  async findById(id: number): Promise<SoinInfirmier | null> {
    const query = `
      SELECT si.*,
             u.nom    AS valideur_nom,
             u.prenom AS valideur_prenom
      FROM soins_infirmiers si
      LEFT JOIN utilisateurs u ON u.id_user = si.valide_par
      WHERE si.id_soin_infirmier = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSoin(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<SoinInfirmier[]> {
    const query = `
      SELECT si.*,
             u.nom    AS valideur_nom,
             u.prenom AS valideur_prenom
      FROM soins_infirmiers si
      LEFT JOIN utilisateurs u ON u.id_user = si.valide_par
      WHERE si.id_patient = $1
      ORDER BY si.date_soin DESC, si.heure_soin DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToSoin(row));
  }

  async findByAdmissionId(admissionId: number): Promise<SoinInfirmier[]> {
    const query = `
      SELECT si.*,
             u.nom    AS valideur_nom,
             u.prenom AS valideur_prenom
      FROM soins_infirmiers si
      LEFT JOIN utilisateurs u ON u.id_user = si.valide_par
      WHERE si.id_admission = $1
      ORDER BY si.date_soin DESC, si.heure_soin DESC
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToSoin(row));
  }

  async findPendingByPatientId(patientId: number): Promise<SoinInfirmier[]> {
    const query = `
      SELECT si.*,
             u.nom    AS valideur_nom,
             u.prenom AS valideur_prenom
      FROM soins_infirmiers si
      LEFT JOIN utilisateurs u ON u.id_user = si.valide_par
      WHERE si.id_patient = $1
        AND si.statut = 'en_attente'
      ORDER BY si.date_soin DESC, si.heure_soin DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToSoin(row));
  }

  async update(id: number, soin: Partial<SoinInfirmier>): Promise<SoinInfirmier> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(soin).forEach(([key, value]) => {
      if (
        value !== undefined &&
        key !== 'id_soin_infirmier' &&
        key !== 'created_at'        &&
        key !== 'updated_at'        &&
        key !== 'statut'            &&
        key !== 'valide_par'        &&
        key !== 'valide_le'         &&
        key !== 'mode_garde'        &&
        key !== 'verifie'
      ) {
        fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) throw new Error('Aucun champ à mettre à jour');

    values.push(id);
    const query = `
      UPDATE soins_infirmiers
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_soin_infirmier = $${paramCount}
      RETURNING *
    `;
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error('Soin infirmier non trouvé');
    return this.mapRowToSoin(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM soins_infirmiers WHERE id_soin_infirmier = $1', [id]);
  }

  /** @deprecated Utiliser valider() */
  async verify(id: number): Promise<SoinInfirmier> {
    const soin = await this.findById(id);
    if (!soin) throw new Error('Soin infirmier non trouvé');
    const nouveauStatut: StatutValidation = soin.statut === 'valide' ? 'en_attente' : 'valide';
    return this.valider(id, nouveauStatut, 0, false);
  }

  async valider(id: number, statut: StatutValidation, validateurId: number, modeGarde: boolean): Promise<SoinInfirmier> {
    const query = `
      UPDATE soins_infirmiers
      SET statut      = $1,
          valide_par  = $2,
          valide_le   = CURRENT_TIMESTAMP,
          mode_garde  = $3,
          verifie     = $4,
          updated_at  = CURRENT_TIMESTAMP
      WHERE id_soin_infirmier = $5
      RETURNING *
    `;
    const values = [
      statut,
      validateurId || null,
      modeGarde,
      statut === 'valide',
      id,
    ];
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error('Soin infirmier non trouvé');
    return this.mapRowToSoin(result.rows[0]);
  }

  private mapRowToSoin(row: Record<string, unknown>): SoinInfirmier {
    return {
      id_soin_infirmier: row.id_soin_infirmier as number,
      id_patient:        row.id_patient        as number,
      id_admission:      row.id_admission      as number | undefined,
      date_soin:         row.date_soin         as Date,
      heure_soin:        row.heure_soin        as string,
      ecg:               row.ecg               as string | undefined,
      ecg_dii_long:      row.ecg_dii_long      as string | undefined,
      injection_iv:      row.injection_iv      as string | undefined,
      injection_im:      row.injection_im      as string | undefined,
      pse:               row.pse               as string | undefined,
      pansement:         row.pansement         as string | undefined,
      autre_soins:       row.autre_soins       as string | undefined,
      realise_par:       row.realise_par       as string,
      cree_par_id:       row.cree_par_id       as number | undefined,
      verifie:           row.verifie           as boolean,
      statut:            (row.statut           as StatutValidation) ?? 'en_attente',
      valide_par:        row.valide_par        as number | undefined,
      valide_le:         row.valide_le         as string | undefined,
      valideur_nom:      row.valideur_nom      as string | undefined,
      valideur_prenom:   row.valideur_prenom   as string | undefined,
      mode_garde:        (row.mode_garde       as boolean) ?? false,
      created_at:        row.created_at        as Date,
      updated_at:        row.updated_at        as Date,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}