// frontend/src/presentation/components/common/PermissionGuard.tsx
//
// Cache son contenu si l'utilisateur n'a pas la permission requise.
//
// Usage :
//   <PermissionGuard permission="soins-infirmiers.write">
//     <button>Nouveau soin</button>
//   </PermissionGuard>
//
//   <PermissionGuard permission="observations.write" fallback={<span>Lecture seule</span>}>
//     <button>Modifier</button>
//   </PermissionGuard>

import type { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
  permission: string;
  children:   ReactNode;
  // Contenu affiché si l'utilisateur n'a pas la permission (optionnel)
  fallback?:  ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { can, loading } = usePermissions();

  // Pendant le chargement — on cache pour éviter le flash
  if (loading) return null;

  if (!can(permission)) return <>{fallback}</>;

  return <>{children}</>;
}