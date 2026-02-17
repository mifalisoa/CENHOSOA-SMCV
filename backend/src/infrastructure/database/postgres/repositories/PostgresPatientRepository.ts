import { Pool } from 'pg';
import { IPatientRepository } from '../../../../domain/repositories/IPatientRepository';
import { Patient, CreatePatientDTO, UpdatePatientDTO, PatientFilters } from '../../../../domain/entities/Patient';
import { PaginatedResponse, PaginationParams } from '../../../../shared/types';

export class PostgresPatientRepository implements IPatientRepository {
  constructor(private pool: Pool) {}

  async create(data: CreatePatientDTO): Promise<Patient> {
    console.log('📝 [Repository] Création patient avec données:', data);
    
    const query = `
      INSERT INTO patient (
        num_dossier, nom_patient, prenom_patient, date_naissance, sexe_patient,
        adresse_patient, tel_patient, profession, groupe_sanguin,
        taille_patient, poids_patient, allergies, antecedents,
        assurance, num_assurance, personne_contact, tel_urgence, statut_patient
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const numDossier = await this.generateNumDossier();
    console.log('🔢 [Repository] Numéro de dossier généré:', numDossier);

    const values = [
      numDossier,
      data.nom_patient,
      data.prenom_patient,
      data.date_naissance,
      data.sexe_patient,
      data.adresse_patient,
      data.tel_patient || null,
      data.profession || null,
      data.groupe_sanguin || null,
      data.taille_patient || null,
      data.poids_patient || null,
      data.allergies || null,
      data.antecedents || null,
      data.assurance || null,
      data.num_assurance || null,
      data.personne_contact,
      data.tel_urgence,
      data.statut_patient || 'externe',
    ];

    const result = await this.pool.query(query, values);
    console.log('✅ [Repository] Patient créé:', result.rows[0]);
    return result.rows[0];
  }

  async findById(id: number): Promise<Patient | null> {
    const query = 'SELECT * FROM patient WHERE id_patient = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByNumDossier(numDossier: string): Promise<Patient | null> {
    const query = 'SELECT * FROM patient WHERE num_dossier = $1';
    const result = await this.pool.query(query, [numDossier]);
    return result.rows[0] || null;
  }

  async findAll(params: PaginationParams, filters?: PatientFilters): Promise<PaginatedResponse<Patient>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (filters) {
      const conditions: string[] = [];
      
      if (filters.statut) {
        conditions.push(`statut_patient = $${paramIndex++}`);
        queryParams.push(filters.statut);
      }
      
      if (filters.groupe_sanguin) {
        conditions.push(`groupe_sanguin = $${paramIndex++}`);
        queryParams.push(filters.groupe_sanguin);
      }
      
      if (filters.assurance) {
        conditions.push(`assurance = $${paramIndex++}`);
        queryParams.push(filters.assurance);
      }
      
      if (filters.search) {
        conditions.push(`(
          LOWER(nom_patient) LIKE LOWER($${paramIndex}) OR
          LOWER(prenom_patient) LIKE LOWER($${paramIndex}) OR
          LOWER(num_dossier) LIKE LOWER($${paramIndex}) OR
          tel_patient LIKE $${paramIndex}
        )`);
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }
      
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }
    }

    const countQuery = `SELECT COUNT(*) FROM patient ${whereClause}`;
    const countResult = await this.pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    queryParams.push(limit, offset);
    const query = `
      SELECT * FROM patient
      ${whereClause}
      ORDER BY date_enregistrement DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    
    const result = await this.pool.query(query, queryParams);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByStatus(status: 'externe' | 'hospitalise', params: PaginationParams): Promise<PaginatedResponse<Patient>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM patient WHERE statut_patient = $1';
    const countResult = await this.pool.query(countQuery, [status]);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT * FROM patient
      WHERE statut_patient = $1
      ORDER BY date_enregistrement DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await this.pool.query(query, [status, limit, offset]);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(query: string): Promise<Patient[]> {
    const searchQuery = `
      SELECT * FROM patient
      WHERE 
        LOWER(nom_patient) LIKE LOWER($1) OR
        LOWER(prenom_patient) LIKE LOWER($1) OR
        LOWER(num_dossier) LIKE LOWER($1) OR
        tel_patient LIKE $1
      ORDER BY nom_patient, prenom_patient
      LIMIT 20
    `;
    
    const result = await this.pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  async update(id: number, data: UpdatePatientDTO): Promise<Patient | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCounter = 1;

    // Construire dynamiquement la requête UPDATE
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCounter++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE patient
      SET ${fields.join(', ')}
      WHERE id_patient = $${paramCounter}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM patient WHERE id_patient = $1';
    await this.pool.query(query, [id]);
  }

  async getStats(): Promise<{ total: number; externes: number; hospitalises: number }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut_patient = 'externe') as externes,
        COUNT(*) FILTER (WHERE statut_patient = 'hospitalise') as hospitalises
      FROM patient
    `;
    
    const result = await this.pool.query(query);
    return {
      total: parseInt(result.rows[0].total),
      externes: parseInt(result.rows[0].externes),
      hospitalises: parseInt(result.rows[0].hospitalises),
    };
  }

  private async generateNumDossier(): Promise<string> {
    const year = new Date().getFullYear();
    const countQuery = `
      SELECT COUNT(*) FROM patient 
      WHERE num_dossier LIKE $1
    `;
    const result = await this.pool.query(countQuery, [`${year}%`]);
    const count = parseInt(result.rows[0].count) + 1;
    
    return `${year}${count.toString().padStart(5, '0')}`;
  }
}