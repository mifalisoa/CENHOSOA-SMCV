import { useState, useEffect } from 'react';
import { X, User, MapPin, Shield, Stethoscope, Bed, Heart, CalendarPlus, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import type { CreatePatientDTO } from '../../../core/entities/Patient';
import { httpClient } from '../../../infrastructure/http/axios.config';
import { toast } from 'sonner';
import NouveauRdvModal from '../rendez-vous/NouveauRdvModal';

interface AddPatientHospitaliseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientDTO & { id_lit?: number }) => Promise<{ id_patient: number; nom_patient: string; prenom_patient: string }>;
}

interface LitDisponible {
  id_lit: number;
  numero_lit: string;
  categorie: string;
  etage?: string;
}

// ← Type pour les médecins chargés depuis l'API
interface Medecin {
  id_user: number;
  nom: string;
  prenom: string;
  specialite?: string;
}

export function AddPatientHospitaliseModal({ isOpen, onClose, onSubmit }: AddPatientHospitaliseModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingLits, setLoadingLits] = useState(false);
  const [litsDisponibles, setLitsDisponibles] = useState<LitDisponible[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<string>('');

  const [formData, setFormData] = useState<Partial<CreatePatientDTO & { id_lit?: number }>>({
    sexe_patient: 'M',
    statut_patient: 'hospitalise',
  });

  // ← États médecins
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loadingMedecins, setLoadingMedecins] = useState(false);

  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [newPatientId, setNewPatientId] = useState<number | null>(null);
  const [newPatientName, setNewPatientName] = useState('');
  const [showRdvModal, setShowRdvModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLitsDisponibles();
      loadMedecins();
    }
  }, [isOpen]);

  const loadLitsDisponibles = async () => {
    try {
      setLoadingLits(true);
      const response = await httpClient.get('/lits');
      const lits = response.data.filter((lit: LitDisponible & { statut: string }) => lit.statut === 'disponible');
      setLitsDisponibles(lits);
    } catch (error) {
      console.error('Erreur chargement lits:', error);
    } finally {
      setLoadingLits(false);
    }
  };

  // ← Charger les médecins depuis l'API
  const loadMedecins = async () => {
    try {
      setLoadingMedecins(true);
      const response = await httpClient.get('/utilisateurs', {
        params: { role: 'medecin', statut: 'actif' }
      });
      const raw = response.data.data ?? response.data ?? [];
      const mapped: Medecin[] = Array.isArray(raw)
        ? raw.map((u: { id_utilisateur?: number; id_user?: number; nom: string; prenom: string; specialite?: string }) => ({
            id_user:    u.id_utilisateur ?? u.id_user ?? 0,
            nom:        u.nom,
            prenom:     u.prenom,
            specialite: u.specialite ?? 'Médecin',
          }))
        : [];
      setMedecins(mapped);
    } catch {
      setMedecins([]);
    } finally {
      setLoadingMedecins(false);
    }
  };

  const handleChange = (field: keyof (CreatePatientDTO & { id_lit?: number }), value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom_patient || !formData.prenom_patient || !formData.date_naissance ||
        !formData.adresse_patient || !formData.medecin_traitant) {
      toast.error('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    try {
      const newPatient = await onSubmit(formData as CreatePatientDTO & { id_lit?: number });
      setNewPatientId(newPatient.id_patient);
      setNewPatientName(`${newPatient.prenom_patient} ${newPatient.nom_patient}`);
      toast.success('Patient hospitalisé créé avec succès !');
      setStep('confirm');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setNewPatientId(null);
    setNewPatientName('');
    setShowRdvModal(false);
    setSelectedCategorie('');
    setFormData({ sexe_patient: 'M', statut_patient: 'hospitalise' });
    onClose();
  };

  // Backdrop bloqué en étape confirm
  const handleBackdropClick = () => {
    if (step === 'confirm') return;
    handleClose();
  };

  const assurances = [
    { value: '', label: 'Aucun' },
    { value: 'PAS', label: 'PAS' },
    { value: 'FMILIF', label: 'FMILIF' },
    { value: 'OCONV', label: 'OCONV' },
    { value: 'PERS', label: 'PERS' },
  ];

  const categoriesDisponibles = Array.from(new Set(litsDisponibles.map(l => l.categorie)))
    .sort((a, b) => {
      const order: Record<string, number> = { '1': 1, '2': 2, '3': 3, 'USIC': 4 };
      return (order[a] || 99) - (order[b] || 99);
    });

  const litsParCategorie = selectedCategorie ? litsDisponibles.filter(l => l.categorie === selectedCategorie) : [];

  const getCategorieLabel = (cat: string) => {
    switch (cat) {
      case '1': return 'Catégorie 1 - Chambres Individuelles';
      case '2': return 'Catégorie 2 - Chambres Doubles';
      case '3': return 'Catégorie 3 - Chambre Quadruple';
      case 'USIC': return 'USIC - Soins Intensifs';
      default: return cat;
    }
  };

  const getLitLabel = (lit: LitDisponible) => {
    const chambre = lit.numero_lit.startsWith('USIC') ? 'USIC' : lit.numero_lit.split('-')[0];
    const num = lit.numero_lit.split('-')[1];
    return `Chambre ${chambre} - Lit ${chambre}-${num}`;
  };

  const countLitsParCategorie = (cat: string) => litsDisponibles.filter(l => l.categorie === cat).length;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleBackdropClick} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-t-2xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {step === 'form' ? 'Nouveau patient hospitalisé' : 'Patient créé !'}
                      </h2>
                      <p className="text-cyan-100 text-sm mt-1">
                        {step === 'form' ? 'Informations essentielles + assignation de lit' : 'Voulez-vous planifier un rendez-vous ?'}
                      </p>
                    </div>
                    <button onClick={handleClose} title="Fermer"
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* ── ÉTAPE 1 : Formulaire ── */}
                {step === 'form' && (
                  <>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-cyan-600" />Informations Personnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                            <Input value={formData.nom_patient || ''} onChange={(e) => handleChange('nom_patient', e.target.value)} placeholder="Nom du patient" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                            <Input value={formData.prenom_patient || ''} onChange={(e) => handleChange('prenom_patient', e.target.value)} placeholder="Prénom du patient" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Date de naissance <span className="text-red-500">*</span></label>
                            <Input type="date"
                              value={formData.date_naissance ? (typeof formData.date_naissance === 'string' ? formData.date_naissance : formData.date_naissance.toISOString().split('T')[0]) : ''}
                              onChange={(e) => handleChange('date_naissance', e.target.value)} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sexe <span className="text-red-500">*</span></label>
                            <div className="flex gap-4">
                              {['M', 'F'].map(s => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="sexe" value={s} checked={formData.sexe_patient === s}
                                    onChange={(e) => handleChange('sexe_patient', e.target.value)}
                                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                                  <span className="text-sm text-gray-700">{s === 'M' ? 'Masculin' : 'Féminin'}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-cyan-600" />Coordonnées
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Adresse <span className="text-red-500">*</span></label>
                            <Input value={formData.adresse_patient || ''} onChange={(e) => handleChange('adresse_patient', e.target.value)} placeholder="Adresse complète" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Téléphone</label>
                            <Input type="tel" value={formData.tel_patient || ''} onChange={(e) => handleChange('tel_patient', e.target.value)} placeholder="034 00 000 00" />
                          </div>
                        </div>
                      </div>

                      {/* ── Médecin traitant — select dynamique ── */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-cyan-600" />Suivi médical
                        </h3>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Médecin traitant <span className="text-red-500">*</span>
                          </label>
                          {loadingMedecins ? (
                            <div className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg text-sm text-gray-400">
                              Chargement des médecins...
                            </div>
                          ) : medecins.length > 0 ? (
                            <select
                              title="Sélectionner un médecin traitant"
                              value={formData.medecin_traitant || ''}
                              onChange={(e) => handleChange('medecin_traitant', e.target.value)}
                              required
                              className="w-full px-3 py-3 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                            >
                              <option value="">Sélectionner un médecin traitant...</option>
                              {medecins.map(m => (
                                <option key={m.id_user} value={`Dr. ${m.prenom} ${m.nom}`}>
                                  Dr. {m.prenom} {m.nom}{m.specialite ? ` — ${m.specialite}` : ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            // Fallback saisie libre si aucun médecin chargé
                            <Input
                              value={formData.medecin_traitant || ''}
                              onChange={(e) => handleChange('medecin_traitant', e.target.value)}
                              placeholder="Dr. Nom Prénom"
                              required
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-cyan-600" />Assurance
                        </h3>
                        <Select label="Type d'assurance" value={formData.assurance || ''} onChange={(e) => handleChange('assurance', e.target.value)} options={assurances} />
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Bed className="w-5 h-5 text-cyan-600" />Assignation de Lit
                        </h3>
                        {loadingLits ? (
                          <div className="text-center py-4 text-gray-500">Chargement des lits...</div>
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-gray-600">1. Catégorie de Lit</label>
                              <select title="Sélectionner une catégorie de lit" value={selectedCategorie}
                                onChange={(e) => { setSelectedCategorie(e.target.value); handleChange('id_lit', undefined); }}
                                className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm">
                                <option value="">Sélectionnez une catégorie</option>
                                {categoriesDisponibles.map(cat => (
                                  <option key={cat} value={cat}>{getCategorieLabel(cat)} ({countLitsParCategorie(cat)} disponible(s))</option>
                                ))}
                              </select>
                              {selectedCategorie && (
                                <p className="text-xs text-cyan-600 flex items-center gap-1">
                                  {selectedCategorie === 'USIC' && <Heart className="w-3 h-3" />}
                                  ♥ Catégorie {selectedCategorie}
                                </p>
                              )}
                            </div>
                            {selectedCategorie && (
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-600">2. Lit à Assigner</label>
                                <select title="Sélectionner un lit" value={formData.id_lit || ''}
                                  onChange={(e) => handleChange('id_lit', e.target.value ? parseInt(e.target.value) : undefined)}
                                  className="w-full px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm">
                                  <option value="">Aucun lit (assigner plus tard)</option>
                                  {litsParCategorie.map(lit => (
                                    <option key={lit.id_lit} value={lit.id_lit}>{getLitLabel(lit)}</option>
                                  ))}
                                </select>
                                {formData.id_lit && (
                                  <p className="text-xs text-cyan-600 flex items-center gap-1">
                                    <Bed className="w-3 h-3" />
                                    Lit sélectionné : {litsParCategorie.find(l => l.id_lit === formData.id_lit)?.numero_lit}
                                  </p>
                                )}
                              </div>
                            )}
                            {litsDisponibles.length === 0 && (
                              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                                Aucun lit disponible. Le patient sera créé sans lit assigné.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </form>

                    <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                      <Button type="button" onClick={handleClose} variant="outline" className="px-6" disabled={loading}>Annuler</Button>
                      <Button onClick={handleSubmit} className="px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white" disabled={loading}>
                        {loading ? 'Ajout en cours...' : 'Ajouter le patient'}
                      </Button>
                    </div>
                  </>
                )}

                {/* ── ÉTAPE 2 : Confirmation + proposition RDV ── */}
                {step === 'confirm' && (
                  <div className="p-8 space-y-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-9 h-9 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{newPatientName}</p>
                        <p className="text-sm text-gray-500 mt-1">a été admis avec succès.</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                          <CalendarPlus className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 mb-1">Planifier un rendez-vous ?</p>
                          <p className="text-sm text-gray-500">
                            Vous pouvez planifier une première consultation ou un suivi maintenant.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => setShowRdvModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-md">
                        <CalendarPlus className="w-5 h-5" />Prendre un RDV maintenant
                      </button>
                      <button onClick={handleClose}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all">
                        <ArrowRight className="w-5 h-5 text-gray-400" />Terminer sans RDV
                      </button>
                    </div>

                    <p className="text-center text-xs text-gray-400">
                      Vous pourrez toujours prendre un RDV depuis le dossier patient.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {showRdvModal && (
        <NouveauRdvModal
          isOpen={showRdvModal}
          onClose={() => setShowRdvModal(false)}
          onSuccess={() => {
            toast.success('Rendez-vous créé ! Il apparaît dans le planning.');
            setShowRdvModal(false);
            handleClose();
          }}
          patientPreselection={newPatientId ?? undefined}
        />
      )}
    </>
  );
}