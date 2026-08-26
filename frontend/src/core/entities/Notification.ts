// frontend/src/core/entities/Notification.ts
//
// Source unique de verite pour le type Notification cote front.
// NotificationsTypes.ts (context) re-exporte ce type au lieu de le redefinir,
// pour eviter d'avoir deux definitions a synchroniser a la main.
//
// Miroir de backend/src/domain/entities/Notification.ts, avec les dates
// en string plutot que Date : c'est ce qui arrive reellement apres passage en JSON.

export interface Notification {
  id_notification: number;
  id_destinataire: number;
  date_creation_notif: string;
  titre_notif: string;
  message_notif: string;
  type_notif?: 'rdv' | 'admission' | 'urgence' | 'système' | 'info' | null;
  priorite?: 'basse' | 'normale' | 'haute' | 'critique' | null;
  urgence: boolean;
  lien?: string | null;
  lue: boolean;
  date_lecture?: string | null;
}

// Non utilise par le frontend actuellement : aucune route POST /notifications
// n'est exposee (les notifications sont creees cote serveur, en effet de bord
// d'autres actions, via NotificationService, puis livrees par Socket.io).
// Garde ici par coherence avec le contrat backend, au cas ou un besoin de
// creation manuelle apparaisse plus tard.
export type CreateNotificationDTO = Omit<
  Notification,
  'id_notification' | 'date_creation_notif' | 'lue' | 'date_lecture'
>;