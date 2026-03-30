// frontend/src/presentation/hooks/useAuth.ts
// ✅ N'exporte QUE un hook → Fast Refresh OK

import { useContext } from 'react';
import { AuthContext } from '../store/AuthTypes';
import type { AuthContextType } from '../store/AuthTypes';

export type { AuthContextType };

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}