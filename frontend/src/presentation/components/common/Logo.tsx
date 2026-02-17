interface LogoProps {
  /** Taille en pixels */
  size?: number;
  /** Variante de couleur */
  variant?: 'default' | 'dark' | 'white';
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Composant Logo CENHOSOA
 * 
 * @param size - Taille en pixels (default: 48)
 * @param variant - 'default' (couleur originale), 'dark' (noir/gris), 'white' (blanc)
 * @param className - Classes CSS additionnelles
 */
export function Logo({ size = 48, variant = 'default', className = '' }: LogoProps) {
  const variantClass = {
    default: '', // Couleur originale
    dark: 'brightness-0 opacity-70', // Noir/gris foncé
    white: 'brightness-0 invert', // Blanc
  }[variant];

  return (
    <img 
      src="/logo.png" 
      alt="CENHOSOA Logo" 
      width={size}
      height={size}
      className={`object-contain ${variantClass} ${className}`.trim()}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}