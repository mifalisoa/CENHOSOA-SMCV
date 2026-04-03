// frontend/src/presentation/pages/auth/ResetPasswordPage.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';

interface Critere {
  label: string;
  test:  (v: string) => boolean;
}

const CRITERES: Critere[] = [
  { label: 'Au moins 8 caractères',  test: (v) => v.length >= 8 },
  { label: 'Une majuscule',          test: (v) => /[A-Z]/.test(v) },
  { label: 'Une minuscule',          test: (v) => /[a-z]/.test(v) },
  { label: 'Un chiffre',             test: (v) => /[0-9]/.test(v) },
  { label: 'Un caractère spécial',   test: (v) => /[!@#$%^&*]/.test(v) },
];

export default function ResetPasswordPage() {
  const navigate    = useNavigate();
  const { token }   = useParams<{ token: string }>();

  const [userName,    setUserName]    = useState('');
  const [tokenValid,  setTokenValid]  = useState<boolean | null>(null);
  const [nouveau,     setNouveau]     = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showNv,      setShowNv]      = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [success,     setSuccess]     = useState(false);

  const criteresOk = CRITERES.filter(c => c.test(nouveau)).length;
  const score      = Math.round((criteresOk / CRITERES.length) * 100);
  const scoreColor = score < 40 ? 'bg-red-500' : score < 80 ? 'bg-amber-500' : 'bg-green-500';
  const scoreLabel = score < 40 ? 'Faible' : score < 80 ? 'Moyen' : 'Fort';
  const formValid  = criteresOk === CRITERES.length && nouveau === confirmation;

  // Vérifie le token au chargement
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    httpClient.get(`/setup/reset-password/${token}/verify`)
      .then(res => {
        setTokenValid(true);
        setUserName(`${res.data.data.prenom} ${res.data.data.nom}`);
      })
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || !token) return;
    setSubmitting(true);
    try {
      await httpClient.post('/setup/reset-password', {
        token,
        nouveau_mot_de_passe: nouveau,
      });
      setSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès !');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error(msg || 'Erreur lors de la réinitialisation');
    } finally {
      setSubmitting(false);
    }
  };

  // Chargement
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  // Token invalide
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lien invalide ou expiré</h2>
          <p className="text-gray-500 text-sm mb-5">
            Ce lien de réinitialisation est invalide ou a expiré (validité : 1 heure).
            Faites une nouvelle demande.
          </p>
          <button onClick={() => navigate('/mot-de-passe-oublie')}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors text-sm">
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-cyan-600 px-6 py-5 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Nouveau mot de passe</h1>
            {userName && <p className="text-cyan-100 text-sm mt-1">Bonjour {userName}</p>}
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Mot de passe modifié !</h3>
                <p className="text-gray-500 text-sm">Vous allez être redirigé vers la page de connexion...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input type={showNv ? 'text' : 'password'} value={nouveau}
                      onChange={e => setNouveau(e.target.value)}
                      placeholder="Votre nouveau mot de passe"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowNv(!showNv)}
                      aria-label={showNv ? 'Masquer' : 'Afficher'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {nouveau && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${scoreColor}`}
                            style={{ width: `${score}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${
                          score < 40 ? 'text-red-500' : score < 80 ? 'text-amber-500' : 'text-green-600'
                        }`}>{scoreLabel}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {CRITERES.map(c => {
                          const ok = c.test(nouveau);
                          return (
                            <div key={c.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                              <CheckCircle2 className={`w-3.5 h-3.5 ${ok ? 'text-green-500' : 'text-gray-300'}`} />
                              {c.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input type={showConf ? 'text' : 'password'} value={confirmation}
                      onChange={e => setConfirmation(e.target.value)}
                      placeholder="Répétez votre mot de passe"
                      className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm ${
                        confirmation && nouveau !== confirmation
                          ? 'border-red-300 bg-red-50'
                          : confirmation && nouveau === confirmation
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)}
                      aria-label={showConf ? 'Masquer' : 'Afficher'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmation && nouveau !== confirmation && (
                    <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <button type="submit" disabled={!formValid || submitting}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Enregistrement...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" />Enregistrer mon mot de passe</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}