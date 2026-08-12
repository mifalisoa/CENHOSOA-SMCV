// backend/src/infrastructure/database/postgres/repositories/PostgresPieceJointeRepository.ts

import { Pool } from 'pg';
import { PieceJointe, CreatePieceJointeDTO, EntiteType } from '../../../../domain/entities/PieceJointe';
import { IPieceJointeRepository } from '../../../../domain/repositories/IPieceJointeRepository';

export class PostgresPieceJointeRepository implements IPieceJointeRepository {
  constructor(private pool: Pool) {}

  async create(data: CreatePieceJointeDTO): Promise<PieceJointe> {
    const query = `
      INSERT INTO pieces_jointes (
        entite_type, entite_id, url_fichier, nom_fichier,
        type_fichier, taille_fichier, ajoute_par
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *
    `;

    const values = [
      data.entite_type,
      data.entite_id,
      data.url_fichier,
      data.nom_fichier,
      data.type_fichier,
      data.taille_fichier,
      data.ajoute_par || null,
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToPieceJointe(result.rows[0]);
  }

  async findByEntite(entiteType: EntiteType, entiteId: number): Promise<PieceJointe[]> {
    const query = `
      SELECT * FROM pieces_jointes 
      WHERE entite_type = $1 AND entite_id = $2 
      ORDER BY date_ajout DESC
    `;
    const result = await this.pool.query(query, [entiteType, entiteId]);
    return result.rows.map(row => this.mapRowToPieceJointe(row));
  }

  async findById(id: number): Promise<PieceJointe | null> {
    const query = 'SELECT * FROM pieces_jointes WHERE id_piece_jointe = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToPieceJointe(result.rows[0]) : null;
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM pieces_jointes WHERE id_piece_jointe = $1';
    await this.pool.query(query, [id]);
  }

  private mapRowToPieceJointe(row: any): PieceJointe {
    return {
      id_piece_jointe: row.id_piece_jointe,
      entite_type:     row.entite_type,
      entite_id:        row.entite_id,
      url_fichier:      row.url_fichier,
      nom_fichier:      row.nom_fichier,
      type_fichier:     row.type_fichier,
      taille_fichier:   row.taille_fichier,
      ajoute_par:       row.ajoute_par,
      date_ajout:       row.date_ajout,
    };
  }
}