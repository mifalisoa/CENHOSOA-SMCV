// frontend/src/presentation/components/common/SignatureBadge.tsx
// Signature visuelle réutilisable pour tous les modules médicaux

import { CheckCircle } from 'lucide-react';

interface SignatureBadgeProps {
  nom:      string;       // "Dr. RAKOTO" ou "INFIRMIER RABE"
  date:     string;       // date ISO ou formatée
  heure?:   string;       // optionnel
  verifie?: boolean;      // affiche badge vert si vérifié
  role?:    string;       // pour adapter le préfixe
}

// Génère les initiales depuis un nom complet
function getInitiales(nom: string): string {
  return nom
    .split(' ')
    .filter(Boolean)
    .map(n => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// Couleur de l'avatar selon le rôle
function getAvatarColor(role?: string): string {
  const map: Record<string, string> = {
    medecin:   'bg-cyan-600',
    interne:   'bg-blue-500',
    stagiaire: 'bg-indigo-500',
    infirmier: 'bg-teal-500',
    admin:     'bg-gray-600',
  };
  return map[role ?? ''] ?? 'bg-gray-500';
}

export function SignatureBadge({ nom, date, heure, verifie, role }: SignatureBadgeProps) {
  const initiales   = getInitiales(nom);
  const avatarColor = getAvatarColor(role);

  const dateFormatee = (() => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch {
      return date;
    }
  })();

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2.5">
        {/* Avatar initiales */}
        <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
          {initiales}
        </div>

        {/* Nom + date */}
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-700 leading-tight">{nom}</span>
          <span className="text-[10px] text-gray-400 leading-tight">
            {dateFormatee}{heure ? ` à ${heure}` : ''}
          </span>
        </div>
      </div>

      {/* Badge vérifié */}
      {verifie && (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-bold">
          <CheckCircle className="w-3 h-3" />
          Vérifié
        </span>
      )}
    </div>
  );
}