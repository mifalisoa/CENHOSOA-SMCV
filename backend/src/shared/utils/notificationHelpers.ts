// backend/src/shared/utils/notificationHelpers.ts

import { pool }                from '../../config/database';
import { notificationService, NotificationData } from '../../application/services/NotificationService';

const MEDICAL_ROLES = ['medecin', 'interne', 'stagiaire', 'infirmier'];

/**
 * Génère le lien vers le dossier patient selon le rôle de l'utilisateur.
 * - Rôles médicaux → /doctor/patients/:id/dossier
 * - Admin/autres   → /patients/:id/dossier
 */
export function getDossierLien(role: string, patientId: number): string {
  return MEDICAL_ROLES.includes(role)
    ? `/doctor/patients/${patientId}/dossier`
    : `/patients/${patientId}/dossier`;
}

/**
 * Lien toujours destiné au médecin traitant (toujours sur la route /doctor/).
 */
export function getDossierLienMedecin(patientId: number): string {
  return `/doctor/patients/${patientId}/dossier`;
}

/**
 * Notifie le médecin traitant d'un patient si l'auteur de l'action
 * est un interne, stagiaire ou infirmier.
 */
export async function notifyMedecinTraitant(
  id_patient:  number,
  auteurRole:  string,
  data:        NotificationData
): Promise<void> {
  // Seuls interne/stagiaire/infirmier déclenchent une notif au médecin
  if (!['interne', 'stagiaire', 'infirmier'].includes(auteurRole)) return;

  try {
    const result = await pool.query(
      'SELECT id_medecin_traitant FROM patients WHERE id_patient = $1',
      [id_patient]
    );
    const id_medecin = result.rows[0]?.id_medecin_traitant;
    if (!id_medecin) return;

    await notificationService.notifyUser(id_medecin, data);
  } catch (err) {
    console.error('[notifyMedecinTraitant] Erreur:', err);
  }
}