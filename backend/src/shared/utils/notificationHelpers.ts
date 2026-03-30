// backend/src/shared/utils/notificationHelpers.ts

import { pool }                from '../../config/database';
import { notificationService, NotificationData } from '../../application/services/NotificationService';

const MEDICAL_ROLES = ['medecin', 'interne', 'stagiaire', 'infirmier'];

export function getDossierLien(role: string, patientId: number): string {
  return MEDICAL_ROLES.includes(role)
    ? `/doctor/patients/${patientId}/dossier`
    : `/patients/${patientId}/dossier`;
}

export function getDossierLienMedecin(patientId: number): string {
  return `/doctor/patients/${patientId}/dossier`;
}

export async function notifyMedecinTraitant(
  id_patient:  number,
  auteurRole:  string,
  data:        NotificationData
): Promise<void> {
  // ── Logs de diagnostic — à retirer une fois le bug trouvé ────────────────
  console.log('🔔 [notifyMedecinTraitant]', { id_patient, auteurRole, titre: data.titre });

  if (!['interne', 'stagiaire', 'infirmier'].includes(auteurRole)) {
    console.log('⛔ [notifyMedecinTraitant] Rôle non autorisé:', auteurRole);
    return;
  }

  try {
    const result = await pool.query(
      'SELECT id_medecin_traitant FROM patients WHERE id_patient = $1',
      [id_patient]
    );
    const id_medecin = result.rows[0]?.id_medecin_traitant;
    console.log('👨‍⚕️ [notifyMedecinTraitant] Médecin trouvé:', id_medecin, '| patient:', id_patient);

    if (!id_medecin) {
      console.log('⚠️ [notifyMedecinTraitant] Aucun médecin traitant pour patient', id_patient);
      return;
    }

    await notificationService.notifyUser(id_medecin, data);
    console.log('✅ [notifyMedecinTraitant] Notif envoyée au médecin', id_medecin);
  } catch (err) {
    console.error('[notifyMedecinTraitant] Erreur:', err);
  }
}