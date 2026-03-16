// presentation/pages/utilisateurs/UtilisateursPage.tsx

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, MoreVertical,
  Edit, Trash2, Lock, Unlock, ArrowLeft,
  RefreshCw, Shield, Mail, Phone, Calendar,
  CheckCircle, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';
import { UtilisateurFormModal, type UtilisateurFormData } from '../../components/modals/UtilisateurFormModal';
import { UtilisateurPermissionsModal } from '../../components/modals/UtilisateurPermissionsModal';
import { DEFAULT_PERMISSIONS, PERMISSION_LABELS } from '../../../shared/constants/permissions.constants';

interface Utilisateur {
  id_user: number;           // ← était id_utilisateur
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'medecin' | 'infirmier' | 'secretaire' | 'pharmacien';
  telephone?: string;
  specialite?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  created_at: string;
  updated_at: string;
}

type RoleType = 'admin' | 'medecin' | 'infirmier' | 'secretaire' | 'pharmacien';
type StatutType = 'actif' | 'inactif' | 'suspendu';

const EMPTY_FORM: UtilisateurFormData = {
  nom: '', prenom: '', email: '', mot_de_passe: '',
  role: 'secretaire', telephone: '', specialite: '', statut: 'actif',
};

export default function UtilisateursPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'permissions'>('list');
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<RoleType | 'all'>('all');
  const [filterStatut, setFilterStatut] = useState<StatutType | 'all'>('all');

  const [showFormModal, setShowFormModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [formInitialData, setFormInitialData] = useState<UtilisateurFormData>(EMPTY_FORM);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<RoleType>('medecin');

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
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormInitialData(EMPTY_FORM);
    setShowFormModal(true);
  };

  const handleEdit = (user: Utilisateur) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormInitialData({
      nom: user.nom, prenom: user.prenom, email: user.email,
      mot_de_passe: '', role: user.role,
      telephone: user.telephone || '', specialite: user.specialite || '',
      statut: user.statut,
    });
    setShowFormModal(true);
  };

  const handleShowPermissions = (user: Utilisateur) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handleFormSubmit = async (data: UtilisateurFormData) => {
    try {
      if (modalMode === 'create') {
        await httpClient.post('/utilisateurs', data);
        toast.success('Utilisateur créé avec succès');
      } else {
        const updateData = { ...data };
        if (!updateData.mot_de_passe) delete (updateData as Partial<UtilisateurFormData>).mot_de_passe;
        await httpClient.put(`/utilisateurs/${selectedUser?.id_user}`, updateData); // ← id_user
        toast.success('Utilisateur modifié avec succès');
      }
      setShowFormModal(false);
      loadUtilisateurs();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || "Erreur lors de l'enregistrement");
      throw error;
    }
  };

  const handleDelete = async (user: Utilisateur) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.prenom} ${user.nom} ?`)) return;
    try {
      await httpClient.delete(`/utilisateurs/${user.id_user}`); // ← id_user
      toast.success('Utilisateur supprimé avec succès');
      loadUtilisateurs();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || 'Erreur lors de la suppression');
    }
  };

  const handleChangeStatut = async (user: Utilisateur, newStatut: StatutType) => {
    try {
      await httpClient.patch(`/utilisateurs/${user.id_user}/statut`, { statut: newStatut }); // ← id_user
      toast.success(`Utilisateur ${newStatut === 'actif' ? 'activé' : newStatut === 'inactif' ? 'désactivé' : 'suspendu'}`);
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
      (filterRole === 'all' || user.role === filterRole) &&
      (filterStatut === 'all' || user.statut === filterStatut);
  });

  const stats = {
    total: utilisateurs.length,
    actifs: utilisateurs.filter(u => u.statut === 'actif').length,
    parRole: {
      medecin: utilisateurs.filter(u => u.role === 'medecin').length,
      infirmier: utilisateurs.filter(u => u.role === 'infirmier').length,
    },
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':      return 'bg-red-100 text-red-700 border-red-300';
      case 'medecin':    return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'infirmier':  return 'bg-green-100 text-green-700 border-green-300';
      case 'secretaire': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'pharmacien': return 'bg-orange-100 text-orange-700 border-orange-300';
      default:           return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif':    return 'bg-green-100 text-green-700';
      case 'inactif':  return 'bg-gray-100 text-gray-700';
      case 'suspendu': return 'bg-red-100 text-red-700';
      default:         return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#08C5D1] to-[#06B3BF] text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                  <p className="text-white/90 mt-1">Comptes, rôles et permissions - CENHOSOA</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadUtilisateurs} disabled={loading} className="flex items-center gap-2 bg-white text-[#08C5D1] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              {activeTab === 'list' && (
                <button onClick={handleCreate} className="flex items-center gap-2 bg-white text-[#08C5D1] px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  <UserPlus className="w-5 h-5" />
                  Nouvel Utilisateur
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total',     value: stats.total },
              { label: 'Actifs',    value: stats.actifs },
              { label: 'Médecins',  value: stats.parRole.medecin },
              { label: 'Infirmiers',value: stats.parRole.infirmier },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white/80 text-sm">{s.label}</p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'list',        label: 'Liste des Utilisateurs', icon: Users  },
              { id: 'permissions', label: 'Permissions par Rôle',   icon: Shield },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'list' | 'permissions')}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-white text-[#08C5D1]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* TAB 1 : Liste */}
        {activeTab === 'list' && (
          <>
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom, email..."
                    aria-label="Rechercher un utilisateur"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08C5D1] focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={filterRole}
                  aria-label="Filtrer par rôle"
                  onChange={(e) => setFilterRole(e.target.value as RoleType | 'all')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08C5D1] focus:border-transparent outline-none"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Admin</option>
                  <option value="medecin">Médecin</option>
                  <option value="infirmier">Infirmier</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="pharmacien">Pharmacien</option>
                </select>
                <select
                  value={filterStatut}
                  aria-label="Filtrer par statut"
                  onChange={(e) => setFilterStatut(e.target.value as StatutType | 'all')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#08C5D1] focus:border-transparent outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
            </div>

            {/* Grille utilisateurs */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#08C5D1] border-t-transparent"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map(user => {
                  const permissions = DEFAULT_PERMISSIONS[user.role] || [];
                  return (
                    <div key={user.id_user} className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-[#08C5D1] transition-all hover:shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#08C5D1] to-[#06B3BF] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user.prenom.charAt(0)}{user.nom.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{user.prenom} {user.nom}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(user.statut)}`}>
                            {user.statut}
                          </span>
                          <div className="relative group">
                            <button
                              title={`Actions pour ${user.prenom} ${user.nom}`}
                              aria-label={`Actions pour ${user.prenom} ${user.nom}`}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 hidden group-hover:block min-w-[180px] z-10">
                              <button onClick={() => handleEdit(user)} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                                <Edit className="w-4 h-4" /> Modifier
                              </button>
                              <button onClick={() => handleShowPermissions(user)} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                                <Shield className="w-4 h-4" /> Voir permissions
                              </button>
                              {user.statut === 'actif' ? (
                                <button onClick={() => handleChangeStatut(user, 'inactif')} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                                  <Lock className="w-4 h-4" /> Désactiver
                                </button>
                              ) : (
                                <button onClick={() => handleChangeStatut(user, 'actif')} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                                  <Unlock className="w-4 h-4" /> Activer
                                </button>
                              )}
                              <button onClick={() => handleDelete(user)} className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600">
                                <Trash2 className="w-4 h-4" /> Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /><span>{user.email}</span></div>
                        {user.telephone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /><span>{user.telephone}</span></div>}
                        {user.specialite && <div className="flex items-center gap-2 text-gray-600"><Shield className="w-4 h-4" /><span className="font-medium">{user.specialite}</span></div>}

                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 mb-1">
                            {user.role === 'admin' ? 'Tous les droits' : `${permissions.length} permissions`}
                          </p>
                          {user.role !== 'admin' && (
                            <div className="flex flex-wrap gap-1">
                              {permissions.slice(0, 3).map((perm: string) => (
                                <span key={perm} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  {perm.split('.')[1]}
                                </span>
                              ))}
                              {permissions.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+{permissions.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 text-xs pt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* TAB 2 : Permissions par rôle */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3">
                {(['medecin', 'infirmier', 'secretaire', 'pharmacien', 'admin'] as RoleType[]).map(role => {
                  const permissions = DEFAULT_PERMISSIONS[role] || [];
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRolePermissions(role)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-lg border-2 font-medium transition-all ${
                        selectedRolePermissions === role
                          ? 'border-[#08C5D1] bg-cyan-50 text-[#08C5D1]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="capitalize">{role}</span>
                      <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {role === 'admin' ? 'Tous' : permissions.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedRolePermissions === 'admin' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Administrateur Super-Utilisateur</h3>
                  <p className="text-red-700 text-sm mt-1">Les administrateurs ont accès à toutes les fonctionnalités sans restriction.</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">
                Permissions du rôle : {selectedRolePermissions}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEFAULT_PERMISSIONS[selectedRolePermissions]?.[0] === '*' ? (
                  <div className="col-span-full text-center py-8">
                    <Shield className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-green-900">Accès complet au système</p>
                    <p className="text-sm text-green-700">Toutes les permissions sont accordées</p>
                  </div>
                ) : (
                  DEFAULT_PERMISSIONS[selectedRolePermissions]?.map((perm: string) => (
                    <div key={perm} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-900 text-sm">{PERMISSION_LABELS[perm] || perm}</p>
                        <p className="text-xs text-green-700">{perm}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedRolePermissions !== 'admin' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">Permissions non accordées</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.keys(PERMISSION_LABELS)
                      .filter(perm => !DEFAULT_PERMISSIONS[selectedRolePermissions].includes(perm))
                      .slice(0, 9)
                      .map(perm => (
                        <div key={perm} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-500 text-sm">{PERMISSION_LABELS[perm]}</p>
                            <p className="text-xs text-gray-400">{perm}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <UtilisateurFormModal
          mode={modalMode}
          initialData={formInitialData}
          onSubmit={handleFormSubmit}
          onClose={() => setShowFormModal(false)}
        />
      )}

      {showPermissionsModal && selectedUser && (
        <UtilisateurPermissionsModal
          utilisateur={selectedUser}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}
    </div>
  );
}