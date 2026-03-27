// frontend/src/presentation/hooks/useSecretaryNotifications.ts
//
// LEÇON : Un hook et un composant ne doivent JAMAIS être dans le même fichier
// si les deux sont exportés. Vite Fast Refresh ne peut pas fonctionner
// correctement car il ne sait pas quel export "rafraîchir" à chaud.
//
// RÈGLE : Un fichier = une responsabilité
// - fichiers hooks  → préfixe "use", export de fonctions
// - fichiers composants → export de JSX

import { useState } from 'react';

export interface SecretaryNotification {
  id:      string;
  titre:   string;
  message: string;
  heure:   string;
  read:    boolean;
}

export function useSecretaryNotifications() {
  const [notifications, setNotifications] = useState<SecretaryNotification[]>([]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, markAsRead, markAllAsRead, dismiss };
}