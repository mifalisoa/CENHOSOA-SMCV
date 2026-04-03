// frontend/src/presentation/pages/auth/ChangerMotDePassePage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface Critere {
  label: string;
  test:  (mdp: string) => boolean;
}

const CRITERES: Critere[] = [
  { label: 'Au moins 8 caractères',    test: (m) => m.length >= 8 },
  { label: 'Une majuscule',            test: (m) => /[A-Z]/.test(m) },
  { label: 'Une minuscule',            test: (m) => /[a-z]/.test(m) },
  { label: 'Un chiffre',               test: (m) => /[0-9]/.test(m) },
  { label: 'Un caractère spécial',     test: (m) => /[!@#$%^&*]/.test(m) },
];

export default function ChangerMotDePassePage() {
  const navigate  = useNavigate();
  const { user, refreshUser } = useAuth();

  const [nouveau,       setNouveau]       = useState('');
  const [confirmation,  setConfirmation]  = useState('');
  const [showNouveau,   setShowNouveau]   = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  const criteresOk   = CRITERES.filter(c => c.test(nouveau)).length;
  const score        = Math.round((criteresOk / CRITERES.length) * 100);
  const scoreColor   = score < 40 ? 'bg-red-500' : score < 80 ? 'bg-amber-500' : 'bg-green-500';
  const scoreLabel   = score < 40 ? 'Faible' : score < 80 ? 'Moyen' : 'Fort';
  const formValid    = criteresOk === CRITERES.length && nouveau === confirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;

    try {
      setSubmitting(true);
      await httpClient.post('/auth/changer-mot-de-passe', {
        nouveau_mot_de_passe: nouveau,
      });

      toast.success('Mot de passe modifié avec succès !');

      // Rafraîchit le contexte auth pour mettre premier_connexion = false
      await refreshUser();

      // Redirige selon le rôle
      const role = user?.role;
      if (role === 'admin')       navigate('/dashboard');
      else if (role === 'secretaire') navigate('/secretary');
      else                        navigate('/doctor');

    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg || 'Erreur lors du changement de mot de passe');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-cyan-600 px-8 py-7 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Première connexion</h1>
          <p className="text-cyan-100 text-sm mt-1">
            Bonjour {user?.prenom} — choisissez votre mot de passe personnel
          </p>
        </div>

        {/* Alerte */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-800 text-xs">
            Votre compte a été créé avec un mot de passe temporaire. Vous devez le changer pour continuer.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showNouveau ? 'text' : 'password'}
                value={nouveau}
                onChange={e => setNouveau(e.target.value)}
                placeholder="Votre nouveau mot de passe"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
                autoFocus
              />
              <button type="button" onClick={() => setShowNouveau(!showNouveau)}
                aria-label={showNouveau ? 'Masquer' : 'Afficher'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNouveau ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Jauge de force */}
          {nouveau.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500">Force du mot de passe</span>
                <span className={`text-xs font-semibold ${
                  score < 40 ? 'text-red-600' : score < 80 ? 'text-amber-600' : 'text-green-600'
                }`}>{scoreLabel}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${scoreColor}`}
                  style={{ width: `${score}%` }} />
              </div>

              {/* Critères */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {CRITERES.map(c => {
                  const ok = c.test(nouveau);
                  return (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs ${
                      ok ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${ok ? 'text-green-500' : 'text-gray-300'}`} />
                      {c.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmation}
                onChange={e => setConfirmation(e.target.value)}
                placeholder="Répétez votre mot de passe"
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm ${
                  confirmation && nouveau !== confirmation
                    ? 'border-red-300 bg-red-50'
                    : confirmation && nouveau === confirmation
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmation && nouveau !== confirmation && (
              <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          {/* Bouton */}
          <button type="submit" disabled={!formValid || submitting}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</>
            ) : (
              <><ShieldCheck className="w-4 h-4" />Définir mon mot de passe</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}