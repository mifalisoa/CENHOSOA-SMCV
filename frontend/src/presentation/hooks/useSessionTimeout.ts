// frontend/src/presentation/hooks/useSessionTimeout.ts
//
// Deconnexion automatique apres 3 minutes d'inactivite.
// Ecoute les evenements souris, clavier, tactile et scroll.
// A appeler dans chaque layout (Admin, Doctor, Secretary).

import { useEffect, useRef, useCallback } from 'react';

const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

const ACTIVITY_EVENTS: string[] = [
  'mousemove', 'mousedown', 'keydown',
  'touchstart', 'touchmove', 'scroll', 'click',
];

interface UseSessionTimeoutOptions {
  onTimeout: () => void;
  enabled?: boolean;
}

export function useSessionTimeout({ onTimeout, enabled = true }: UseSessionTimeoutOptions) {
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Garde la ref a jour sans recreer les callbacks
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Demarre le timer au montage
    resetTimer();

    // Reinitialie le timer a chaque activite
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled, resetTimer]);
}