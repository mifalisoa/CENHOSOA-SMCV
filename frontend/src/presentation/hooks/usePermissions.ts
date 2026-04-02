// frontend/src/presentation/hooks/usePermissions.ts
//
// Récupère les permissions de l'utilisateur connecté depuis le backend.
// Utilise un cache en mémoire pour éviter les appels répétés.
// Expose une fonction `can(permission)` pour vérifier une permission.

import { useState, useEffect, useCallback } from 'react';
import { useAuth }    from './useAuth';
import { httpClient } from '../../infrastructure/http/axios.config';

interface PermissionsState {
  permissions: string[];
  loading:     boolean;
  error:       string | null;
}

// Cache global — évite de refetch à chaque montage de composant
let permissionsCache: string[] | null = null;
let cacheUserId: number | null        = null;

export function usePermissions() {
  const { user } = useAuth();

  const [state, setState] = useState<PermissionsState>({
    permissions: [],
    loading:     true,
    error:       null,
  });

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setState({ permissions: [], loading: false, error: null });
      return;
    }

    // Admin a toujours tout — pas besoin de fetch
    if (user.role === 'admin') {
      setState({ permissions: ['*'], loading: false, error: null });
      return;
    }

    // Cache valide pour le même utilisateur
    if (permissionsCache !== null && cacheUserId === user.id_user) {
      setState({ permissions: permissionsCache, loading: false, error: null });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await httpClient.get<{ success: boolean; data: { permissions: string[] } }>(
        `/utilisateurs/${user.id_user}/permissions`
      );
      const perms = response.data.data.permissions ?? [];
      permissionsCache = perms;
      cacheUserId      = user.id_user;
      setState({ permissions: perms, loading: false, error: null });
    } catch (err) {
      console.error('[usePermissions] Erreur fetch permissions:', err);
      setState({ permissions: [], loading: false, error: 'Impossible de charger les permissions' });
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Vide le cache à la déconnexion
  useEffect(() => {
    if (!user) {
      permissionsCache = null;
      cacheUserId      = null;
    }
  }, [user]);

  // Vérifie si l'utilisateur a une permission
  const can = useCallback((permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (state.permissions.includes('*')) return true;
    return state.permissions.includes(permission);
  }, [user, state.permissions]);

  return {
    permissions: state.permissions,
    loading:     state.loading,
    error:       state.error,
    can,
  };
}