export interface Notification {
    id_notification: number;
    id_destinataire: number;
    date_creation_notif: Date;
    titre_notif: string;
    message_notif: string;
    type_notif?: 'rdv' | 'admission' | 'urgence' | 'système' | 'info' | null;
    priorite?: 'basse' | 'normale' | 'haute' | 'critique' | null;
    urgence: boolean;
    lien?: string | null;
    lue: boolean;
    date_lecture?: Date | null;
}

export type CreateNotificationDTO = Omit<Notification, 'id_notification' | 'date_creation_notif' | 'lue' | 'date_lecture'>;