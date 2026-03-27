// frontend/src/presentation/hooks/useLogout.ts
//
// LEÇON : Ne pas dupliquer la logique de déconnexion dans chaque dashboard.
// Ce hook centralise l'état du modal et l'appel à logout().
// Chaque sidebar l'utilise avec une seule ligne.

import { useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

export function useLogout() {
  const { logout, user } = useAuth();
  const navigate         = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const requestLogout = () => setShowModal(true);
  const cancelLogout  = () => setShowModal(false);

  const confirmLogout = async () => {
    setShowModal(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return {
    showLogoutModal: showModal,
    requestLogout,   // ← appeler ce-ci au clic du bouton "Déconnexion"
    cancelLogout,
    confirmLogout,
    userName: user ? `${user.prenom} ${user.nom}` : undefined,
    userRole: user?.role,
  };
}