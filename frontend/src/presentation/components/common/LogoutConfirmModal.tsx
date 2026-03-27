// frontend/src/presentation/components/common/LogoutConfirmModal.tsx
//
// LEÇON : Un composant réutilisable doit être générique et sans couleur hardcodée.
// On passe la couleur en prop pour que chaque dashboard puisse l'utiliser
// avec sa propre identité visuelle — ici tous utilisent cyan.

import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen:    boolean;
  onConfirm: () => void;
  onCancel:  () => void;
  userName?: string;
  userRole?: string;
}

export function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  userName,
  userRole,
}: LogoutConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header coloré */}
              <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">Déconnexion</h2>
                    <p className="text-cyan-100 text-xs">CENHOSOA</p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Corps */}
              <div className="px-6 py-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm mb-1">
                      Voulez-vous vraiment vous déconnecter ?
                    </p>
                    {userName && (
                      <p className="text-gray-500 text-xs">
                        Connecté en tant que{' '}
                        <span className="font-semibold text-gray-700">{userName}</span>
                        {userRole && (
                          <span className="ml-1 text-cyan-600 capitalize">({userRole})</span>
                        )}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      Votre session sera fermée et vous serez redirigé vers la page de connexion.
                    </p>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-cyan-100 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}