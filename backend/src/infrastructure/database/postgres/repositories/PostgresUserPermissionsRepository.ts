// backend/src/infrastructure/database/postgres/repositories/PostgresUserPermissionsRepository.ts
//
// LEÇON : Ce repository gère la table user_permissions.
// Quand un utilisateur n'a pas encore de permissions personnalisées,
// on retourne les permissions par défaut de son rôle.

import { Pool } from 'pg';
import { DEFAULT_PERMISSIONS } from '../../../../shared/constants/permissions';

export class PostgresUserPermissionsRepository {
  constructor(private pool: Pool) {}

  // Récupère les permissions d'un utilisateur
  // Si aucune permission personnalisée → retourne les défauts du rôle
  async getByUserId(id_user: number, role: string): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT permission FROM user_permissions WHERE id_user = $1 ORDER BY permission',
      [id_user]
    );

    if (result.rows.length > 0) {
      return result.rows.map((r: { permission: string }) => r.permission);
    }

    // Pas de permissions personnalisées → défauts du rôle
    return DEFAULT_PERMISSIONS[role] ?? [];
  }

  // Remplace toutes les permissions d'un utilisateur
  async setPermissions(id_user: number, permissions: string[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Supprimer toutes les permissions existantes
      await client.query('DELETE FROM user_permissions WHERE id_user = $1', [id_user]);

      // Insérer les nouvelles permissions
      if (permissions.length > 0) {
        const values = permissions.map((_, i) => `($1, $${i + 2})`).join(', ');
        await client.query(
          `INSERT INTO user_permissions (id_user, permission) VALUES ${values}`,
          [id_user, ...permissions]
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

  // Vérifie si un utilisateur a une permission spécifique
  async hasPermission(id_user: number, role: string, permission: string): Promise<boolean> {
    // Admin → toujours autorisé
    if (role === 'admin') return true;

    const result = await this.pool.query(
      'SELECT 1 FROM user_permissions WHERE id_user = $1 AND permission = $2',
      [id_user, permission]
    );

    if (result.rows.length > 0) return true;

    // Pas de permissions personnalisées → vérifier les défauts du rôle
    const count = await this.pool.query(
      'SELECT COUNT(*) FROM user_permissions WHERE id_user = $1',
      [id_user]
    );

    if (parseInt(count.rows[0].count) === 0) {
      const defaults = DEFAULT_PERMISSIONS[role] ?? [];
      return defaults.includes(permission) || defaults.includes('*');
    }

    return false;
  }
}