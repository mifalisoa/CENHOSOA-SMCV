import { Pool } from 'pg';
import { DocumentPatient } from '../../../../domain/entities/DocumentPatient';
import { IDocumentPatientRepository } from '../../../../domain/repositories/IDocumentPatientRepository';

export class PostgresDocumentPatientRepository implements IDocumentPatientRepository {
  constructor(private pool: Pool) {}

  async create(document: Omit<DocumentPatient, 'id_document' | 'created_at' | 'updated_at'>): Promise<DocumentPatient> {
    const query = `
      INSERT INTO documents_patients (
        id_patient, id_admission, titre, type_fichier, nom_fichier,
        url_fichier, taille_fichier, description,
        date_ajout, heure_ajout, ajoute_par
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `;

    const values = [
      document.id_patient,
      document.id_admission || null,
      document.titre,
      document.type_fichier,
      document.nom_fichier,
      document.url_fichier,
      document.taille_fichier,
      document.description || null,
      document.date_ajout,
      document.heure_ajout,
      document.ajoute_par || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToDocument(result.rows[0]);
  }

  async findById(id: number): Promise<DocumentPatient | null> {
    const query = 'SELECT * FROM documents_patients WHERE id_document = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToDocument(result.rows[0]) : null;
  }

  async findByPatientId(patientId: number): Promise<DocumentPatient[]> {
    const query = `
      SELECT * FROM documents_patients 
      WHERE id_patient = $1 
      ORDER BY date_ajout DESC, heure_ajout DESC
    `;
    const result = await this.pool.query(query, [patientId]);
    return result.rows.map(row => this.mapRowToDocument(row));
  }

  async findByAdmissionId(admissionId: number): Promise<DocumentPatient[]> {
    const query = `
      SELECT * FROM documents_patients 
      WHERE id_admission = $1 
      ORDER BY date_ajout DESC, heure_ajout DESC
    `;
    const result = await this.pool.query(query, [admissionId]);
    return result.rows.map(row => this.mapRowToDocument(row));
  }

  async update(id: number, document: Partial<DocumentPatient>): Promise<DocumentPatient> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(document).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id_document' && key !== 'created_at' && key !== 'updated_at') {
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
      UPDATE documents_patients 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id_document = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Document non trouvé');
    }
    return this.mapRowToDocument(result.rows[0]);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM documents_patients WHERE id_document = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToDocument(row: any): DocumentPatient {
    return {
      id_document: row.id_document,
      id_patient: row.id_patient,
      id_admission: row.id_admission,
      titre: row.titre,
      type_fichier: row.type_fichier,
      nom_fichier: row.nom_fichier,
      url_fichier: row.url_fichier,
      taille_fichier: row.taille_fichier,
      description: row.description,
      date_ajout: row.date_ajout,
      heure_ajout: row.heure_ajout,
      ajoute_par: row.ajoute_par,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}