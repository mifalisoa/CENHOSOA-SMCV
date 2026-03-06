import { useState } from 'react';
import { X, User, MapPin, Shield, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import type { CreatePatientDTO } from '../../../core/entities/Patient';
import { toast } from 'sonner';

interface AddPatientHospitaliseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientDTO) => Promise<void>;
}

export function AddPatientHospitaliseModal({ isOpen, onClose, onSubmit }: AddPatientHospitaliseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatePatientDTO>>({
    sexe_patient: 'M',
    statut_patient: 'hospitalisé', // ✅ FIX: avec accent
  });

  const handleChange = (field: keyof CreatePatientDTO, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Validation des champs obligatoires (sans personne_contact, tel_urgence)
    if (!formData.nom_patient || !formData.prenom_patient || !formData.date_naissance || 
        !formData.adresse_patient || !formData.medecin_traitant) {
      toast.error('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData as CreatePatientDTO);
      toast.success('Patient hospitalisé créé avec succès !');
      setFormData({ sexe_patient: 'M', statut_patient: 'hospitalisé' });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const assurances = [
    { value: '', label: 'Aucun' },
    { value: 'PAS', label: 'PAS' },
    { value: 'FMILIF', label: 'FMILIF' },
    { value: 'OCONV', label: 'OCONV' },
    { value: 'PERS', label: 'PERS' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-t-2xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Nouveau patient hospitalisé</h2>
                    <p className="text-cyan-100 text-sm mt-1">Remplissez les 8 informations essentielles</p>
                  </div>
                  <button
                    onClick={onClose}
                    title="Fermer"
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                {/* Informations Personnelles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-600" />
                    Informations Personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
                      <Input
                        value={formData.nom_patient || ''}
                        onChange={(e) => handleChange('nom_patient', e.target.value)}
                        placeholder="Nom du patient"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Prénom <span className="text-red-500">*</span></label>
                      <Input
                        value={formData.prenom_patient || ''}
                        onChange={(e) => handleChange('prenom_patient', e.target.value)}
                        placeholder="Prénom du patient"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date de naissance <span className="text-red-500">*</span></label>
                      <Input
                        type="date"
                        value={
                          formData.date_naissance 
                            ? (typeof formData.date_naissance === 'string' 
                                ? formData.date_naissance 
                                : formData.date_naissance.toISOString().split('T')[0])
                            : ''
                        }
                        onChange={(e) => handleChange('date_naissance', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sexe <span className="text-red-500">*</span></label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sexe"
                            value="M"
                            checked={formData.sexe_patient === 'M'}
                            onChange={(e) => handleChange('sexe_patient', e.target.value)}
                            className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="text-sm text-gray-700">Masculin</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="sexe"
                            value="F"
                            checked={formData.sexe_patient === 'F'}
                            onChange={(e) => handleChange('sexe_patient', e.target.value)}
                            className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="text-sm text-gray-700">Féminin</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                    Coordonnées
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-gray-700">Adresse <span className="text-red-500">*</span></label>
                      <Input
                        value={formData.adresse_patient || ''}
                        onChange={(e) => handleChange('adresse_patient', e.target.value)}
                        placeholder="Adresse complète"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Téléphone</label>
                      <Input
                        type="tel"
                        value={formData.tel_patient || ''}
                        onChange={(e) => handleChange('tel_patient', e.target.value)}
                        placeholder="034 00 000 00"
                      />
                    </div>
                  </div>
                </div>

                {/* Médecin traitant */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-cyan-600" />
                    Suivi médical
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Médecin traitant <span className="text-red-500">*</span></label>
                      <Input
                        value={formData.medecin_traitant || ''}
                        onChange={(e) => handleChange('medecin_traitant', e.target.value)}
                        placeholder="Dr. Nom Prénom"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Assurance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-600" />
                    Assurance
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Select
                      label="Type d'assurance"
                      value={formData.assurance || ''}
                      onChange={(e) => handleChange('assurance', e.target.value)}
                      options={assurances}
                    />
                  </div>
                </div>
              </form>

              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="px-6"
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Ajout en cours...' : 'Ajouter le patient'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}