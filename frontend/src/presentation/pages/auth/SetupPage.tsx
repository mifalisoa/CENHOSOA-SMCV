// frontend/src/presentation/pages/auth/SetupPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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

export default function SetupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '', confirmation: '',
  });
  const [showMdp,     setShowMdp]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const criteresOk = CRITERES.filter(c => c.test(form.mot_de_passe)).length;
  const score      = Math.round((criteresOk / CRITERES.length) * 100);
  const scoreColor = score < 40 ? 'bg-red-500' : score < 80 ? 'bg-amber-500' : 'bg-green-500';
  const scoreLabel = score < 40 ? 'Faible' : score < 80 ? 'Moyen' : 'Fort';

  const formValid =
    form.nom && form.prenom && form.email &&
    criteresOk === CRITERES.length &&
    form.mot_de_passe === form.confirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    setSubmitting(true);
    try {
      await httpClient.post('/setup', {
        nom:          form.nom,
        prenom:       form.prenom,
        email:        form.email,
        mot_de_passe: form.mot_de_passe,
      });
      toast.success('Configuration terminée — bienvenue sur CENHOSOA-SMCV !');
      navigate('/login');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error(msg || 'Erreur lors de la configuration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-100">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Configuration initiale</h1>
          <p className="text-gray-500 mt-2">Créez votre compte administrateur pour commencer</p>
        </div>

        {/* Étapes */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-800">
            <p className="font-semibold mb-1">Cette page ne s'affiche qu'une seule fois.</p>
            <p>Après la création de votre compte, elle sera définitivement inaccessible. Notez bien votre email et votre mot de passe.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-cyan-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white">Compte Administrateur</h2>
            <p className="text-cyan-100 text-sm">CENHOSOA-SMCV — Service des Maladies Cardio-Vasculaires</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">

            {/* Nom + Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="Nom de famille"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={form.prenom}
                  onChange={e => setForm({ ...form, prenom: e.target.value })}
                  placeholder="Prénom"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value.toLowerCase() })}
                placeholder="votre-email@exemple.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Cet email servira à vous connecter et à recevoir les alertes système.
              </p>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type={showMdp ? 'text' : 'password'} required value={form.mot_de_passe}
                  onChange={e => setForm({ ...form, mot_de_passe: e.target.value })}
                  placeholder="Choisissez un mot de passe fort"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                />
                <button type="button" onClick={() => setShowMdp(!showMdp)}
                  aria-label={showMdp ? 'Masquer' : 'Afficher'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Jauge */}
              {form.mot_de_passe && (
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
                      const ok = c.test(form.mot_de_passe);
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
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required value={form.confirmation}
                  onChange={e => setForm({ ...form, confirmation: e.target.value })}
                  placeholder="Répétez votre mot de passe"
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm ${
                    form.confirmation && form.mot_de_passe !== form.confirmation
                      ? 'border-red-300 bg-red-50'
                      : form.confirmation && form.mot_de_passe === form.confirmation
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
              {form.confirmation && form.mot_de_passe !== form.confirmation && (
                <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button type="submit" disabled={!formValid || submitting}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Configuration en cours...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" />Créer mon compte administrateur</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          CENHOSOA-SMCV — Configuration unique à la première installation
        </p>
      </motion.div>
    </div>
  );
}