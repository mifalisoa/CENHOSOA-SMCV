/**
 * Design Tokens - Système de design centralisé pour CENHOSOA
 * 
 * Ce fichier contient toutes les constantes de design pour assurer
 * la cohérence visuelle à travers l'application.
 */

export const COLORS = {
  // Couleur principale - Cyan
  primary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4', // Couleur principale
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  
  // Couleurs par rôle
  roles: {
    admin: '#06b6d4',      // Cyan
    docteur: '#3b82f6',    // Blue
    secretaire: '#10b981', // Green
  },
  
  // Couleurs sémantiques
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  
  // Couleurs neutres
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

export const LOGO_SIZES = {
  xs: 'w-8 h-8',      // 32px - Pour les icônes
  sm: 'w-12 h-12',    // 48px - Pour les petits logos
  md: 'w-16 h-16',    // 64px - Taille standard header
  lg: 'w-20 h-20',    // 80px - Pour les sections importantes
  xl: 'w-32 h-32',    // 128px - Pour les pages de login
  '2xl': 'w-64 h-64', // 256px - Pour les grandes bannières
} as const;

export const HEADER_HEIGHT = 'h-20'; // 80px

export const SIDEBAR_WIDTH = {
  collapsed: 'w-20',  // 80px
  expanded: 'w-70',   // 280px
} as const;