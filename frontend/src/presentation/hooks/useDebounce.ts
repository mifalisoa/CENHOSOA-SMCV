// frontend/src/presentation/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * Retarde la mise à jour d'une valeur.
 * Évite de déclencher des calculs coûteux à chaque frappe clavier.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}