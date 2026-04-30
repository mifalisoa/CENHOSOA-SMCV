import { Pool, PoolClient } from 'pg';
import { Traitement } from '../../../../domain/entities/Traitement';
import { ITraitementRepository } from '../../../../domain/repositories/ITraitementRepository';
import { StatutValidation } from '../../../../shared/types';
import { randomUUID } from 'crypto';

export class PostgresTraitementRepository implements ITraitementRepository {
  constructor(private pool: Pool) {}

  // ── SELECT avec jointure valideur ─────────────────────────────────────────────
  private readonly SELECT_WITH_VALIDEUR = `
    SELECT t.*,
           u.nom    AS valideur_nom,
           u.prenom AS valideur_prenom
    FROM traitements t
    LEFT JOIN utilisateurs u ON u.id_user = t.valide_par
  `;

  // ── Création unique (rétrocompatibilité) ──────────────────────────────────────
  async create(traitement: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde'>): Promise<Traitement> {
    const query = `
      INSERT INTO traitements (
        id_patient, id_admission, id_ordonnance,
        date_prescription, heure_prescription,
        type_document, diagnostic, prescripteur, lieu_prescription,
        medicament, dosage, voie_administration, frequence, duree,
        instructions, observations_speciales,
        cree_par_id, statut, mode_garde
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, 'en_attente', false
      ) RETURNING *
    `;

    const values = [
      traitement.id_patient,
      traitement.id_admission      || null,
      traitement.id_ordonnance     || null,
      traitement.date_prescription,
      traitement.heure_prescription,
      traitement.type_document,
      traitement.diagnostic        || null,
      traitement.prescripteur      || null,
      traitement.lieu_prescription || null,
      traitement.medicament,
      traitement.dosage,
      traitement.voie_administration,
      traitement.frequence,
      traitement.duree,
      traitement.instructions      || null,
      traitement.observations_speciales || null,
      traitement.cree_par_id       || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToTraitement(result.rows[0]);
  }

  // ── Création multiple — transaction atomique ──────────────────────────────────
  async createMany(traitements: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde'>[]): Promise<Traitement[]> {
    if (traitements.length === 0) throw new Error('Au moins un médicament est requis');

    const id_ordonnance = randomUUID();
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const created: Traitement[] = [];

      for (const traitement of traitements) {
        const query = `
          INSERT INTO traitements (
            id_patient, id_admission, id_ordonnance,
            date_prescription, heure_prescription,
            type_document, diagnostic, prescripteur, lieu_prescription,
            medicament, dosage, voie_administration, frequence, duree,
            instructions, observations_speciales,
            cree_par_id, statut, mode_garde
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9,
            $10, $11, $12, $13, $14, $15, $16,
            $17, 'en_attente', false
          ) RETURNING *
        `;

        const values = [
          traitement.id_patient,
          traitement.id_admission      || null,
          id_ordonnance,
          traitement.date_prescription,
          traitement.heure_prescription,
          traitement.type_document,
          traitement.diagnostic        || null,
          traitement.prescripteur      || null,
          traitement.lieu_prescription || null,
          traitement.medicament,
          traitement.dosage,
          traitement.voie_administration,
          traitement.frequence,
          traitement.duree,
          traitement.instructions      || null,
          traitement.observations_speciales || null,
          traitement.cree_par_id       || null,
        ];

        const result = await client.query(query, values);
        created.push(this.mapRowToTraitement(result.rows[0]));
      }

      await client.query('COMMIT');
      return created;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ── Lecture ───────────────────────────────────────────────────────────────────

  async findById(id: number): Promise<Traitement | null> {
    const query = `${this.SELECT_WITH_VALIDEUR} WHERE t.id_traitement = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToTraitement(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<Traitement[]> {
    const query = `
      ${this.SELECT_WITH_VALIDEUR}
      WHERE t.id_patient = $1
      ORDER BY t.date_prescription DESC, t.heure_prescription DESC, t.id_ordonnance, t.id_traitement
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToTraitement(row));
  }

  async findByAdmissionId(admissionId: number): Promise<Traitement[]> {
    const query = `
      ${this.SELECT_WITH_VALIDEUR}
      WHERE t.id_admission = $1
      ORDER BY t.date_prescription DESC, t.heure_prescription DESC, t.id_ordonnance, t.id_traitement
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToTraitement(row));
  }

  async findByOrdonnanceId(ordonnanceId: string): Promise<Traitement[]> {
    const query = `
      ${this.SELECT_WITH_VALIDEUR}
      WHERE t.id_ordonnance = $1
      ORDER BY t.id_traitement
    `;
    const result = await this.pool.query(query, [ordonnanceId]);
    return result.rows.map(row => this.mapRowToTraitement(row));
  }

  async findPendingByPatientId(patientId: number): Promise<Traitement[]> {
    const query = `
      ${this.SELECT_WITH_VALIDEUR}
      WHERE t.id_patient = $1
        AND t.statut = 'en_attente'
      ORDER BY t.date_prescription DESC, t.heure_prescription DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToTraitement(row));
  }

  // ── Mise à jour ───────────────────────────────────────────────────────────────

  async update(id: number, traitement: Partial<Traitement>): Promise<Traitement> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(traitement).forEach(([key, value]) => {
      if (
        value !== undefined    &&
        key !== 'id_traitement' &&
        key !== 'id_ordonnance' &&
        key !== 'created_at'   &&
        key !== 'updated_at'   &&
        key !== 'statut'       &&
        key !== 'valide_par'   &&
        key !== 'valide_le'    &&
        key !== 'mode_garde'
      ) {
        fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) throw new Error('Aucun champ à mettre à jour');

    values.push(id);
    const query = `
      UPDATE traitements
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_traitement = $${paramCount}
      RETURNING *
    `;
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error('Traitement non trouvé');
    return this.mapRowToTraitement(result.rows[0]);
  }

  // ── Suppression ───────────────────────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    await this.pool.query('DELETE FROM traitements WHERE id_traitement = $1', [id]);
  }

  // ── Validation ────────────────────────────────────────────────────────────────

  async valider(id: number, statut: StatutValidation, validateurId: number, modeGarde: boolean): Promise<Traitement> {
    const query = `
      UPDATE traitements
      SET statut      = $1,
          valide_par  = $2,
          valide_le   = CURRENT_TIMESTAMP,
          mode_garde  = $3,
          updated_at  = CURRENT_TIMESTAMP
      WHERE id_traitement = $4
      RETURNING *
    `;
    const values = [
      statut,
      validateurId || null,
      modeGarde,
      id,
    ];
    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) throw new Error('Traitement non trouvé');
    return this.mapRowToTraitement(result.rows[0]);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private mapRowToTraitement(row: Record<string, unknown>): Traitement {
    return {
      id_traitement:          row.id_traitement          as number,
      id_patient:             row.id_patient             as number,
      id_admission:           row.id_admission           as number | undefined,
      id_ordonnance:          row.id_ordonnance          as string | undefined,
      date_prescription:      row.date_prescription      as Date,
      heure_prescription:     row.heure_prescription     as string,
      type_document:          row.type_document          as 'ordonnance' | 'traitement',
      diagnostic:             row.diagnostic             as string | undefined,
      prescripteur:           row.prescripteur           as string | undefined,
      lieu_prescription:      row.lieu_prescription      as string | undefined,
      medicament:             row.medicament             as string,
      dosage:                 row.dosage                 as string,
      voie_administration:    row.voie_administration    as string,
      frequence:              row.frequence              as string,
      duree:                  row.duree                  as string,
      instructions:           row.instructions           as string | undefined,
      observations_speciales: row.observations_speciales as string | undefined,
      cree_par_id:            row.cree_par_id            as number | undefined,
      statut:                 (row.statut                as StatutValidation) ?? 'en_attente',
      valide_par:             row.valide_par             as number | undefined,
      valide_le:              row.valide_le              as string | undefined,
      valideur_nom:           row.valideur_nom           as string | undefined,
      valideur_prenom:        row.valideur_prenom        as string | undefined,
      mode_garde:             (row.mode_garde            as boolean) ?? false,
      created_at:             row.created_at             as Date,
      updated_at:             row.updated_at             as Date,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}