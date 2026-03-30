import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, X, HelpCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { toast } from 'sonner';

const REMEMBER_KEY = 'cenhosoa_remember_email';
const ATTEMPTS_KEY = 'cenhosoa_login_attempts';
const LOCKOUT_KEY  = 'cenhosoa_lockout_until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 5 * 60 * 1000;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function LoginSkeleton() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-5/12 bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center min-h-[280px] md:min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48" />
            <div className="relative z-10 w-[160px] h-[160px] md:w-[260px] md:h-[260px] rounded-full bg-white/20 animate-pulse" />
          </div>
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm mx-auto w-full space-y-5">
              <div className="text-center space-y-2 mb-8">
                <div className="h-8 w-36 bg-gray-200 rounded-xl animate-pulse mx-auto" />
                <div className="h-4 w-56 bg-gray-100 rounded-lg animate-pulse mx-auto" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="h-12 w-full bg-cyan-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal Aide ────────────────────────────────────────────────────────────────

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-600" />
            Instructions de connexion
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Fermer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
            <p className="font-semibold text-cyan-900 mb-2">Comment se connecter</p>
            <ul className="space-y-2 text-cyan-800">
              {[
                'Utilisez votre email professionnel en minuscules',
                'Votre mot de passe vous a ete fourni par l\'administrateur',
                'Le mot de passe respecte les majuscules et minuscules',
                'La session expire apres 3 minutes d\'inactivite',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="font-semibold text-red-900 mb-1 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" /> Securite
            </p>
            <p className="text-red-700 text-xs">Apres 5 tentatives echouees, le compte est bloque 5 minutes.</p>
            <p className="font-semibold text-red-800 mt-2">admin@cenhosoa.mg</p>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={onClose} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors text-sm">
            Compris
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Modal Mot de passe oublie ─────────────────────────────────────────────────

function ForgotModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Mot de passe oublie</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Fermer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-cyan-600" />
            </div>
            <p className="font-medium text-gray-900 mb-2">Contactez l'administrateur</p>
            <p className="text-sm text-gray-500 mb-4">L'administrateur reinitialise votre mot de passe et vous le communique.</p>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Adresse email de l'administrateur</p>
              <p className="font-bold text-cyan-700">admin@cenhosoa.mg</p>
            </div>
          </div>
        </div>
        <div className="p-5 pt-0">
          <button onClick={onClose} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-colors text-sm">
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isInitializing } = useAuth();

  const savedEmail = localStorage.getItem(REMEMBER_KEY) || '';

  const [email,       setEmail]       = useState(savedEmail);
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [rememberMe,  setRememberMe]  = useState(!!savedEmail);
  const [errors,      setErrors]      = useState({ email: '', password: '' });
  const [submitting,  setSubmitting]  = useState(false);
  const [showHelp,    setShowHelp]    = useState(false);
  const [showForgot,  setShowForgot]  = useState(false);
  const [touched,     setTouched]     = useState({ email: false, password: false });
  // ✅ Caps Lock warning
  const [capsLock,    setCapsLock]    = useState(false);

  const [attempts,    setAttempts]    = useState(() => parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0'));
  const [lockedUntil, setLockedUntil] = useState(() => parseInt(localStorage.getItem(LOCKOUT_KEY)  || '0'));
  const [countdown,   setCountdown]   = useState(0);

  // Compte a rebours blocage
  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setCountdown(0); setLockedUntil(0); setAttempts(0);
        localStorage.removeItem(ATTEMPTS_KEY); localStorage.removeItem(LOCKOUT_KEY);
        clearInterval(interval);
      } else { setCountdown(remaining); }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  // ✅ Detection Caps Lock via evenement clavier
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setCapsLock(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup',   handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup',   handleKey);
    };
  }, []);

  const isLocked = lockedUntil > Date.now();

  // Validation en temps reel apres que le champ a ete quitte
  useEffect(() => {
    if (!touched.email) return;
    if (!email) setErrors(p => ({ ...p, email: 'Email requis' }));
    else if (!/\S+@\S+\.\S+/.test(email)) setErrors(p => ({ ...p, email: 'Format email invalide' }));
    else setErrors(p => ({ ...p, email: '' }));
  }, [email, touched.email]);

  useEffect(() => {
    if (!touched.password) return;
    if (!password) setErrors(p => ({ ...p, password: 'Mot de passe requis' }));
    else if (password.length < 6) setErrors(p => ({ ...p, password: 'Minimum 6 caracteres' }));
    else setErrors(p => ({ ...p, password: '' }));
  }, [password, touched.password]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.toLowerCase());
  };

  const isFormValid = !!(email && password.length >= 6 && /\S+@\S+\.\S+/.test(email) && !errors.email && !errors.password);

  // Force mot de passe
  const getStrength = () => {
    if (!password) return null;
    let s = 0;
    if (password.length >= 6)          s++;
    if (password.length >= 10)         s++;
    if (/[A-Z]/.test(password))        s++;
    if (/[0-9]/.test(password))        s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (s <= 2) return { label: 'Faible', color: 'bg-red-400',   w: 'w-1/3' };
    if (s <= 3) return { label: 'Moyen',  color: 'bg-amber-400', w: 'w-2/3' };
    return           { label: 'Fort',   color: 'bg-green-500', w: 'w-full' };
  };
  const strength = getStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setTouched({ email: true, password: true });
    if (!email || !password || password.length < 6 || !/\S+@\S+\.\S+/.test(email)) return;

    setSubmitting(true);
    try {
      await login(email, password);
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      if (rememberMe) localStorage.setItem(REMEMBER_KEY, email);
      else            localStorage.removeItem(REMEMBER_KEY);
      toast.success('Connexion reussie !');
      navigate('/');
    } catch (error: unknown) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(ATTEMPTS_KEY, String(newAttempts));
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_MS;
        setLockedUntil(lockUntil);
        localStorage.setItem(LOCKOUT_KEY, String(lockUntil));
        toast.error('Compte bloque 5 minutes apres 5 tentatives.');
      } else {
        const left = MAX_ATTEMPTS - newAttempts;
        toast.error(`${error instanceof Error ? error.message : 'Identifiants incorrects'} — ${left} tentative${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isInitializing) return <LoginSkeleton />;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">

            {/* Left Panel */}
            <div className="w-full md:w-5/12 bg-gradient-to-br from-cyan-500 to-cyan-700 flex flex-col items-center justify-center text-white relative overflow-hidden py-10 md:py-0 md:min-h-[640px]">
              <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-x-40 -translate-y-40" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-40 translate-y-40" />
              <div className="relative z-10 flex flex-col items-center gap-4 px-8">
                <motion.img src="/logo.png" alt="CENHOSOA"
                  className="w-48 h-48 md:w-72 md:h-72 object-contain drop-shadow-xl"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                />
                <div className="text-center hidden md:block">
                
                  <div className="mt-4 h-px bg-white/20 w-24 mx-auto" />
                  <p className="text-cyan-200 text-xs mt-3 leading-relaxed">
                    Plateforme numerique de gestion<br />des dossiers patients
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">

                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
                  <p className="text-gray-500 text-sm mt-1">Entrez vos identifiants pour acceder a votre espace</p>
                </div>

                {/* Alerte blocage */}
                <AnimatePresence>
                  {isLocked && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 overflow-hidden">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Acces temporairement bloque</p>
                        <p className="text-xs text-red-600 mt-0.5">
                          Reessayez dans <span className="font-bold tabular-nums">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Alerte tentatives */}
                <AnimatePresence>
                  {!isLocked && attempts > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 overflow-hidden">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-800 font-medium">
                        {MAX_ATTEMPTS - attempts} tentative{MAX_ATTEMPTS - attempts > 1 ? 's' : ''} restante{MAX_ATTEMPTS - attempts > 1 ? 's' : ''} avant blocage
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
                    <div className="relative">
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email && touched.email ? 'text-red-400' : 'text-cyan-500'}`} />
                      <Input
                        id="email" type="email"
                        placeholder="prenom.nom@cenhosoa.mg"
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={() => setTouched(p => ({ ...p, email: true }))}
                        autoComplete="email"
                        disabled={isLocked}
                        aria-invalid={!!(errors.email && touched.email)}
                        className={`pl-10 pr-9 py-2.5 w-full border-2 rounded-xl text-sm transition-all ${
                          errors.email && touched.email   ? 'border-red-300 bg-red-50'
                          : touched.email && !errors.email ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 focus:border-cyan-500'
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      {touched.email && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          {errors.email
                            ? <AlertTriangle className="w-4 h-4 text-red-400" />
                            : <CheckCircle2  className="w-4 h-4 text-green-500" />}
                        </div>
                      )}
                    </div>
                    <AnimatePresence>
                      {errors.email && touched.email && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-red-500 text-xs flex items-center gap-1" role="alert">
                          <AlertTriangle className="w-3 h-3" /> {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.password && touched.password ? 'text-red-400' : 'text-cyan-500'}`} />
                      <Input
                        id="password"
                        type={showPwd ? 'text' : 'password'}
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched(p => ({ ...p, password: true }))}
                        autoComplete="current-password"
                        disabled={isLocked}
                        className={`pl-10 pr-10 py-2.5 w-full border-2 rounded-xl text-sm transition-all ${
                          errors.password && touched.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-cyan-500'
                        } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                        aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* ✅ Caps Lock warning — affiché uniquement si actif */}
                    <AnimatePresence>
                      {capsLock && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                          role="alert"
                        >
                          <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8M5 20h14a2 2 0 002-2V8a2 2 0 00-.586-1.414l-5-5A2 2 0 0012.172 1H5a2 2 0 00-2 2v15a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs text-amber-800 font-medium">
                            Majuscules actives — votre mot de passe est sensible a la casse
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {errors.password && touched.password && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="text-red-500 text-xs flex items-center gap-1" role="alert">
                          <AlertTriangle className="w-3 h-3" /> {errors.password}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Force + regles */}
                    <AnimatePresence>
                      {password && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${strength?.color} ${strength?.w} transition-all duration-500 rounded-full`} />
                            </div>
                            <span className={`text-xs font-medium ${strength?.label === 'Faible' ? 'text-red-500' : strength?.label === 'Moyen' ? 'text-amber-500' : 'text-green-600'}`}>
                              {strength?.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {[
                              { ok: password.length >= 6,            label: '6 caracteres min.' },
                              { ok: /[A-Z]/.test(password),          label: 'Une majuscule' },
                              { ok: /[0-9]/.test(password),          label: 'Un chiffre' },
                              { ok: /[^A-Za-z0-9]/.test(password),   label: 'Caractere special' },
                            ].map((r, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${r.ok ? 'bg-green-500' : 'bg-gray-200'}`}>
                                  {r.ok && <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 6 6"><path d="M1 3l1.5 1.5L5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span className={`text-xs ${r.ok ? 'text-green-700' : 'text-gray-400'}`}>{r.label}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Remember me + mot de passe oublie */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ accentColor: '#06b6d4' }} className="w-4 h-4 rounded cursor-pointer" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors select-none">Se souvenir de moi</span>
                    </label>
                    <button type="button" onClick={() => setShowForgot(true)}
                      className="text-xs text-cyan-600 hover:text-cyan-700 hover:underline font-medium transition-colors">
                      Mot de passe oublie ?
                    </button>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={submitting || isLocked}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-[0.98] ${
                      isFormValid && !isLocked
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white shadow-lg shadow-cyan-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } disabled:opacity-70`}>
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Verification en cours...
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center justify-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Bloque ({Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')})
                      </span>
                    ) : 'Se connecter'}
                  </button>

                  <div className="text-center pt-1">
                    <button type="button" onClick={() => setShowHelp(true)}
                      className="text-xs text-gray-400 hover:text-cyan-600 transition-colors inline-flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Aide a la connexion
                    </button>
                  </div>
                </form>

                <p className="text-center text-[10px] text-gray-300 uppercase tracking-widest mt-6">
                  CENHOSOA - Plateforme Numerique
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showHelp   && <HelpModal   onClose={() => setShowHelp(false)}   />}
        {showForgot && <ForgotModal onClose={() => setShowForgot(false)} />}
      </AnimatePresence>
    </>
  );
}