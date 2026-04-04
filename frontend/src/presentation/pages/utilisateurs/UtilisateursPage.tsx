// frontend/src/presentation/pages/utilisateurs/UtilisateursPage.tsx

import { useState, useEffect, useRef } from 'react';
import {
  Users, UserPlus, Search, MoreVertical,
  Edit, Trash2, Lock, Unlock, ArrowLeft,
  RefreshCw, Shield, Mail, Phone, Calendar,
  KeyRound,
} from 'lucide-react';
import { useNavigate }    from 'react-router-dom';
import axios              from 'axios';
import { httpClient }     from '../../../infrastructure/http/axios.config';
import { toast }          from 'sonner';
import { useAuth }        from '../../hooks/useAuth';
import { UtilisateurFormModal, type UtilisateurFormData } from '../../components/modals/UtilisateurFormModal';
import { UtilisateurPermissionsModal } from '../../components/modals/UtilisateurPermissionsModal';
import { DEFAULT_PERMISSIONS, PERMISSION_LABELS } from '../../../shared/constants/permissions.constants';

type RoleType   = 'admin' | 'medecin' | 'interne' | 'stagiaire' | 'infirmier' | 'secretaire';
type StatutType = 'actif' | 'inactif' | 'suspendu';

interface Utilisateur {
  id_user:            number;
  nom:                string;
  prenom:             string;
  email:              string;
  role:               RoleType;
  telephone?:         string;
  specialite?:        string;
  statut:             StatutType;
  premier_connexion?: boolean;
  created_at:         string;
  updated_at:         string;
}

// ── Dialog confirmation générique ─────────────────────────────────────────────

interface ConfirmDialogProps {
  titre:        string;
  message:      string;
  detail?:      string;
  confirmLabel: string;
  confirmColor: string;
  icon:         React.ReactNode;
  onConfirm:    () => void;
  onCancel:     () => void;
  loading?:     boolean;
}

function ConfirmDialog({ titre, message, detail, confirmLabel, confirmColor, icon, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmColor === 'red' ? 'bg-red-100' : 'bg-amber-100'}`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{titre}</h3>
        <p className="text-gray-600 text-sm mb-1">{message}</p>
        {detail && <p className="text-gray-400 text-xs mb-5">{detail}</p>}
        {!detail && <div className="mb-5" />}
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              confirmColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}>
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_FORM: UtilisateurFormData = {
  nom: '', prenom: '', email: '', mot_de_passe: '',
  role: 'secretaire', telephone: '', specialite: '', statut: 'actif',
};

const ROLE_OPTIONS: { value: RoleType | 'all'; label: string }[] = [
  { value: 'all',        label: 'Tous les rôles' },
  { value: 'admin',      label: 'Admin'           },
  { value: 'medecin',    label: 'Médecin'         },
  { value: 'interne',    label: 'Interne'         },
  { value: 'stagiaire',  label: 'Stagiaire'       },
  { value: 'infirmier',  label: 'Infirmier'       },
  { value: 'secretaire', label: 'Secrétaire'      },
];

const getRoleColor = (role: string) => ({
  admin:      'bg-red-100    text-red-700    border-red-300',
  medecin:    'bg-blue-100   text-blue-700   border-blue-300',
  interne:    'bg-cyan-100   text-cyan-700   border-cyan-300',
  stagiaire:  'bg-sky-100    text-sky-700    border-sky-300',
  infirmier:  'bg-green-100  text-green-700  border-green-300',
  secretaire: 'bg-purple-100 text-purple-700 border-purple-300',
} as Record<string, string>)[role] ?? 'bg-gray-100 text-gray-700 border-gray-300';

const getStatutColor = (statut: string) => ({
  actif:    'bg-green-100 text-green-700',
  inactif:  'bg-gray-100  text-gray-700',
  suspendu: 'bg-red-100   text-red-700',
} as Record<string, string>)[statut] ?? 'bg-gray-100 text-gray-700';

const getRoleLabel = (role: string) => ({
  admin: 'Admin', medecin: 'Médecin', interne: 'Interne',
  stagiaire: 'Stagiaire', infirmier: 'Infirmier', secretaire: 'Secrétaire',
} as Record<string, string>)[role] ?? role;

// ── Menu actions ──────────────────────────────────────────────────────────────

interface ActionsMenuProps {
  user:               Utilisateur;
  isSelf:             boolean;
  onEdit:             () => void;
  onPermissions:      () => void;
  onChangeStatut:     (statut: StatutType) => void;
  onDelete:           () => void;
  onReinitialiserMdp: () => void;
}

function ActionsMenu({ user, isSelf, onEdit, onPermissions, onChangeStatut, onDelete, onReinitialiserMdp }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} title="Actions" aria-label="Actions"
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[210px] z-20">
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2.5 text-sm text-gray-700">
            <Edit className="w-4 h-4 text-gray-400" />Modifier
          </button>
          <button onClick={() => { setOpen(false); onPermissions(); }}
            className="w-full px-4 py-2.5 text-left hover:bg-cyan-50 flex items-center gap-2.5 text-sm text-cyan-700 font-medium">
            <Shield className="w-4 h-4 text-cyan-500" />Gérer permissions
          </button>
          <button onClick={() => { setOpen(false); onReinitialiserMdp(); }}
            className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-2.5 text-sm text-amber-700">
            <KeyRound className="w-4 h-4 text-amber-500" />Réinitialiser mot de passe
          </button>
          <div className="my-1 border-t border-gray-100" />
          {!isSelf && (
            user.statut === 'actif' ? (
              <button onClick={() => { setOpen(false); onChangeStatut('inactif'); }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2.5 text-sm text-gray-700">
                <Lock className="w-4 h-4 text-gray-400" />Désactiver
              </button>
            ) : (
              <button onClick={() => { setOpen(false); onChangeStatut('actif'); }}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2.5 text-sm text-gray-700">
                <Unlock className="w-4 h-4 text-gray-400" />Activer
              </button>
            )
          )}
          {!isSelf && <div className="my-1 border-t border-gray-100" />}
          {!isSelf && (
            <button onClick={() => { setOpen(false); onDelete(); }}
              className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2.5 text-sm text-red-600">
              <Trash2 className="w-4 h-4" />Supprimer
            </button>
          )}
          {isSelf && (
            <div className="px-4 py-2 text-xs text-gray-400 italic">
              Impossible de modifier votre propre compte
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UtilisateursPage() {
  const navigate                = useNavigate();
  const { user: currentUser }   = useAuth();

  const [utilisateurs,         setUtilisateurs]         = useState<Utilisateur[]>([]);
  const [loading,              setLoading]              = useState(true);
  const [searchQuery,          setSearchQuery]          = useState('');
  const [filterRole,           setFilterRole]           = useState<RoleType | 'all'>('all');
  const [filterStatut,         setFilterStatut]         = useState<StatutType | 'all'>('all');
  const [showFormModal,        setShowFormModal]        = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [modalMode,            setModalMode]            = useState<'create' | 'edit'>('create');
  const [selectedUser,         setSelectedUser]         = useState<Utilisateur | null>(null);
  const [formInitialData,      setFormInitialData]      = useState<UtilisateurFormData>(EMPTY_FORM);
  const [confirmDelete,        setConfirmDelete]        = useState<Utilisateur | null>(null);
  const [confirmReinit,        setConfirmReinit]        = useState<Utilisateur | null>(null);
  const [actionLoading,        setActionLoading]        = useState(false);

  useEffect(() => { loadUtilisateurs(); }, []);

  const loadUtilisateurs = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/utilisateurs');
      let users: Utilisateur[] = [];
      if (response.data.data) {
        users = Array.isArray(response.data.data) ? response.data.data : (response.data.data.data || []);
      } else {
        users = Array.isArray(response.data) ? response.data : [];
      }
      setUtilisateurs(users);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
      setUtilisateurs([]);
    } finally { setLoading(false); }
  };

  const handleCreate = () => {
    setModalMode('create'); setFormInitialData(EMPTY_FORM); setShowFormModal(true);
  };

  const handleEdit = (user: Utilisateur) => {
    setModalMode('edit'); setSelectedUser(user);
    setFormInitialData({
      nom: user.nom, prenom: user.prenom, email: user.email,
      mot_de_passe: '', role: user.role,
      telephone: user.telephone || '', specialite: user.specialite || '', statut: user.statut,
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (data: UtilisateurFormData) => {
    try {
      if (modalMode === 'create') {
        await httpClient.post('/utilisateurs', data);
        toast.success('Utilisateur créé — email envoyé avec les identifiants');
      } else {
        const updateData = { ...data };
        if (!updateData.mot_de_passe) delete (updateData as Partial<UtilisateurFormData>).mot_de_passe;
        await httpClient.put(`/utilisateurs/${selectedUser?.id_user}`, updateData);
        toast.success('Utilisateur modifié avec succès');
      }
      setShowFormModal(false); loadUtilisateurs();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || "Erreur lors de l'enregistrement");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setActionLoading(true);
      await httpClient.delete(`/utilisateurs/${confirmDelete.id_user}`);
      toast.success('Utilisateur supprimé avec succès');
      setConfirmDelete(null); loadUtilisateurs();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || 'Erreur lors de la suppression');
    } finally { setActionLoading(false); }
  };

  const handleReinitialiserMdp = async () => {
    if (!confirmReinit) return;
    try {
      setActionLoading(true);
      await httpClient.post(`/utilisateurs/${confirmReinit.id_user}/reinitialiser-mot-de-passe`);
      toast.success(`Mot de passe réinitialisé — email envoyé à ${confirmReinit.email}`);
      setConfirmReinit(null); loadUtilisateurs();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || 'Erreur lors de la réinitialisation');
    } finally { setActionLoading(false); }
  };

  const handleChangeStatut = async (user: Utilisateur, newStatut: StatutType) => {
    try {
      await httpClient.patch(`/utilisateurs/${user.id_user}/statut`, { statut: newStatut });
      toast.success(`Utilisateur ${newStatut === 'actif' ? 'activé' : 'désactivé'}`);
      loadUtilisateurs();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || 'Erreur lors du changement de statut');
    }
  };

  const filteredUsers = utilisateurs.filter(user => {
    const matchSearch = searchQuery === '' ||
      user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch &&
      (filterRole   === 'all' || user.role   === filterRole) &&
      (filterStatut === 'all' || user.statut === filterStatut);
  });

  const stats = {
    total:     utilisateurs.length,
    actifs:    utilisateurs.filter(u => u.statut === 'actif').length,
    medecins:  utilisateurs.filter(u => ['medecin', 'interne', 'stagiaire'].includes(u.role)).length,
    soignants: utilisateurs.filter(u => u.role === 'infirmier').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-cyan-500 text-white shadow-sm">
        <div className="p-4 sm:p-6">

          {/* Ligne titre + actions */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-white/90 hover:text-white shrink-0">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Retour</span>
              </button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg shrink-0">
                  <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-3xl font-bold truncate">Gestion des Utilisateurs</h1>
                  <p className="text-white/90 text-xs hidden sm:block mt-0.5">Comptes, rôles et permissions</p>
                </div>
              </div>
            </div>

            {/* Boutons — icônes seules sur mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button onClick={loadUtilisateurs} disabled={loading} aria-label="Actualiser"
                className="flex items-center gap-1.5 bg-white text-cyan-600 px-2 sm:px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
              <button onClick={handleCreate} aria-label="Nouvel utilisateur"
                className="flex items-center gap-1.5 bg-white text-cyan-600 px-2 sm:px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Nouvel Utilisateur</span>
              </button>
            </div>
          </div>

          {/* Stats — 2 colonnes sur mobile, 4 sur desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Total',             value: stats.total     },
              { label: 'Actifs',            value: stats.actifs    },
              { label: 'Médecins/Internes', value: stats.medecins  },
              { label: 'Infirmiers',        value: stats.soignants },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-lg p-2.5 sm:p-3">
                <p className="text-white/80 text-xs sm:text-sm">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6">

        {/* ── Filtres ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          {/* Recherche pleine largeur */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher par nom, prénom, email..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none text-sm" />
          </div>
          {/* Filtres rôle + statut — côte à côte */}
          <div className="grid grid-cols-2 gap-2">
            <select value={filterRole} onChange={e => setFilterRole(e.target.value as RoleType | 'all')}
              aria-label="Filtrer par rôle"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none text-sm">
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value as StatutType | 'all')}
              aria-label="Filtrer par statut"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none text-sm">
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
        </div>

        {/* ── Grille utilisateurs ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-500 text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredUsers.map(user => {
              const permissions = DEFAULT_PERMISSIONS[user.role] || [];
              const isSelf = user.id_user === currentUser?.id_user;
              return (
                <div key={user.id_user}
                  className="bg-white rounded-xl p-4 sm:p-5 border-2 border-gray-200 hover:border-cyan-400 transition-all hover:shadow-lg">

                  {/* En-tête carte */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm sm:text-lg">
                          {user.prenom.charAt(0)}{user.nom.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {user.prenom} {user.nom}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatutColor(user.statut)}`}>
                        {user.statut}
                      </span>
                      <ActionsMenu
                        user={user}
                        isSelf={isSelf}
                        onEdit={() => handleEdit(user)}
                        onPermissions={() => { setSelectedUser(user); setShowPermissionsModal(true); }}
                        onChangeStatut={s => handleChangeStatut(user, s)}
                        onDelete={() => setConfirmDelete(user)}
                        onReinitialiserMdp={() => setConfirmReinit(user)}
                      />
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="space-y-1.5 text-sm">
                    {user.premier_connexion && (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-xs text-amber-700 font-medium">Mot de passe temporaire</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.telephone && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                        <Phone className="w-3.5 h-3.5 shrink-0" />{user.telephone}
                      </div>
                    )}
                    {user.specialite && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">{user.specialite}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        {user.role === 'admin' ? 'Tous les droits' : `${permissions.length} permissions`}
                      </p>
                      {user.role !== 'admin' && (
                        <div className="flex flex-wrap gap-1">
                          {permissions.slice(0, 3).map((perm: string) => (
                            <span key={perm} className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 rounded text-[10px]">
                              {PERMISSION_LABELS[perm] ?? perm}
                            </span>
                          ))}
                          {permissions.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                              +{permissions.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-400 text-xs pt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <UtilisateurFormModal mode={modalMode} initialData={formInitialData}
          onSubmit={handleFormSubmit} onClose={() => setShowFormModal(false)} />
      )}
      {showPermissionsModal && selectedUser && (
        <UtilisateurPermissionsModal utilisateur={selectedUser} onClose={() => setShowPermissionsModal(false)} />
      )}

      {confirmDelete && (
        <ConfirmDialog titre="Supprimer cet utilisateur ?"
          message={`${confirmDelete.prenom} ${confirmDelete.nom}`}
          detail={`${confirmDelete.email} · ${getRoleLabel(confirmDelete.role)}`}
          confirmLabel="Supprimer" confirmColor="red"
          icon={<Trash2 className="w-7 h-7 text-red-600" />}
          onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)} loading={actionLoading} />
      )}

      {confirmReinit && (
        <ConfirmDialog titre="Réinitialiser le mot de passe ?"
          message={`${confirmReinit.prenom} ${confirmReinit.nom}`}
          detail={`Un mot de passe temporaire sera envoyé à ${confirmReinit.email}`}
          confirmLabel="Réinitialiser et envoyer" confirmColor="amber"
          icon={<KeyRound className="w-7 h-7 text-amber-600" />}
          onConfirm={handleReinitialiserMdp} onCancel={() => setConfirmReinit(null)} loading={actionLoading} />
      )}
    </div>
  );
}