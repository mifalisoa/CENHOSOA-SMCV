import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Checkbox } from '../../components/common/Checkbox';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(email, password);
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          
         {/* Left Panel - Branding (Logo Seul) */}
<motion.div
  initial={{ x: -50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ delay: 0.2, duration: 0.5 }}
  className="w-full md:w-1/2 bg-gradient-to-br from-cyan-500 to-cyan-600 p-12 flex flex-col items-center justify-center text-white relative overflow-hidden min-h-[600px]"
>
  {/* Cercles décoratifs en arrière-plan */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
  
  <div className="relative z-10 flex items-center justify-center w-full h-full">
    {/* Logo CENHOSOA - SANS CADRE, TRÈS GRAND */}
    <motion.img 
      src="/logo.png" 
      alt="CENHOSOA Logo" 
      className="w-[300px] h-[300px] object-contain drop-shadow-2xl"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.05 }}
    />
  </div>
</motion.div>
          {/* Right Panel - Login Form */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white"
          >
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
                <p className="text-gray-500 text-sm">Veuillez vous authentifier pour continuer</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email professionnel</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                    <Input
                      type="email"
                      placeholder="votre.nom@cenhosoa.mg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-12 pr-4 py-3 w-full border-2 rounded-xl transition-all ${
                        errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-cyan-500'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-12 pr-12 py-3 w-full border-2 rounded-xl transition-all ${
                        errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-cyan-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                </div>

                {/* Actions secondaires */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                      Se souvenir de moi
                    </label>
                  </div>
                  <button type="button" className="text-sm text-cyan-600 hover:underline font-medium">
                    Aide
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-cyan-100 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Authentification...' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                  Plateforme Numérique • CENHOSOA
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}