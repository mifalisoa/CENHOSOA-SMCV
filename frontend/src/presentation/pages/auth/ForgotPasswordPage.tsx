// frontend/src/presentation/pages/auth/ForgotPasswordPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, SendHorizonal } from 'lucide-react';
import { httpClient } from '../../../infrastructure/http/axios.config';

export default function ForgotPasswordPage() {
  const navigate    = useNavigate();
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await httpClient.post('/setup/mot-de-passe-oublie', { email });
      setSubmitted(true);
    } catch {
      // Affiche toujours le succès pour ne pas révéler si l'email existe
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <button onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />Retour à la connexion
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-cyan-600 px-6 py-5 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Mot de passe oublié</h1>
            <p className="text-cyan-100 text-sm mt-1">CENHOSOA-SMCV</p>
          </div>

          <div className="p-6">
            {!submitted ? (
              <>
                <p className="text-gray-600 text-sm mb-5 text-center">
                  Saisissez votre adresse email. Si elle est enregistrée, vous recevrez un lien pour réinitialiser votre mot de passe.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse email
                    </label>
                    <input type="email" required value={email}
                      onChange={e => setEmail(e.target.value.toLowerCase())}
                      placeholder="votre-email@exemple.com"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                      autoFocus
                    />
                  </div>
                  <button type="submit" disabled={loading || !email}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi...</>
                    ) : (
                      <><SendHorizonal className="w-4 h-4" />Envoyer le lien</>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email envoyé !</h3>
                <p className="text-gray-500 text-sm mb-1">
                  Si l'adresse <strong>{email}</strong> est enregistrée dans notre système, vous recevrez un email avec un lien de réinitialisation.
                </p>
                <p className="text-gray-400 text-xs mt-3">
                  Le lien est valable 1 heure. Vérifiez aussi vos spams.
                </p>
                <button onClick={() => navigate('/login')}
                  className="mt-5 w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors text-sm">
                  Retour à la connexion
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}