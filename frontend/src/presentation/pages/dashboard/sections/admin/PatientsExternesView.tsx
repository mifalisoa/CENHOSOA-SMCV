import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Filter, MapPin, 
  Phone, User, Clock, ChevronRight, Hash, ChevronLeft 
} from 'lucide-react';
import { usePatients } from '../../../../hooks/usePatients';
import { AddPatientExterneModal } from '../../../../components/patients/AddPatientExterneModal';
import { Button } from '../../../../components/common/Button';
import type { CreatePatientDTO } from '../../../../../core/entities/Patient';

export default function PatientsExternesView() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'ancien'>('recent');
  const [filterSexe, setFilterSexe] = useState<'Tous' | 'M' | 'F'>('Tous');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const { patients, loading, createPatient, searchPatients, total } = usePatients('externe');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.length >= 2) searchPatients(query);
  };

  // ── MODIFICATION ──────────────────────────────────────────────────────────
  // Avant : await createPatient(data) → void, setShowAddModal(false)
  // Après : createPatient retourne Patient → on le retourne au modal
  //         Le modal récupère id_patient pour pré-remplir le RDV automatiquement
  const handleAddPatient = async (data: CreatePatientDTO) => {
    const newPatient = await createPatient(data); // ← createPatient retourne déjà Patient
    // NE PAS fermer le modal ici — c'est le modal qui gère sa fermeture
    // après l'étape de confirmation / RDV
    return newPatient; // ← retourné au modal pour setNewPatientId(newPatient.id_patient)
  };
  // ─────────────────────────────────────────────────────────────────────────

  const calculateAge = (dateNaissance: string | Date) => {
    if (!dateNaissance) return '?';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const processedPatients = useMemo(() => {
    let result = [...patients];
    if (filterSexe !== 'Tous') result = result.filter(p => p.sexe_patient === filterSexe);
    return result.sort((a, b) => {
      const da = new Date(a.date_enregistrement).getTime();
      const db = new Date(b.date_enregistrement).getTime();
      return sortBy === 'recent' ? db - da : da - db;
    });
  }, [patients, filterSexe, sortBy]);

  const totalPages = Math.max(1, Math.ceil(processedPatients.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const currentPatients = processedPatients.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const changePage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const applyFilter = (cb: () => void) => { cb(); setCurrentPage(1); };

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (safePage > 3) pages.push('...');
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="w-full space-y-4 pb-6 px-0 sm:px-4 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Patients <span className="text-cyan-600">Externes</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium italic">
            {total} dossiers enregistrés en consultation externe
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-100 transition-all font-bold active:scale-95 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Nouveau Patient
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-2 md:p-3 rounded-2xl md:rounded-full border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center w-full">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, n° dossier..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-full focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100 w-full md:w-auto overflow-x-auto">
          <Filter size={14} className="text-cyan-600 ml-3 shrink-0" />
          <select
            title="Trier par date"
            className="bg-transparent text-[11px] md:text-xs font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-2"
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => applyFilter(() => setSortBy(e.target.value as 'recent' | 'ancien'))}
          >
            <option value="recent">Tri : Plus récents</option>
            <option value="ancien">Tri : Plus anciens</option>
          </select>
          <div className="w-px h-4 bg-slate-200" />
          <select
            title="Filtrer par genre"
            className="bg-transparent text-[11px] md:text-xs font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-2"
            value={filterSexe}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => applyFilter(() => setFilterSexe(e.target.value as 'Tous' | 'M' | 'F'))}
          >
            <option value="Tous">Tous Genres</option>
            <option value="M">Hommes</option>
            <option value="F">Femmes</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {currentPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <User size={40} className="mb-3 opacity-30" />
              <p className="font-bold text-sm">Aucun patient trouvé</p>
            </div>
          ) : (
            currentPatients.map((patient) => (
              <motion.div
                key={patient.id_patient}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/patients/${patient.id_patient}/dossier`)}
                className="group relative bg-white border border-slate-100 p-4 md:p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/5 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />
                <div className="flex items-center gap-4 flex-1">
                  <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-lg md:text-2xl border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-colors text-center uppercase">
                    {patient.nom_patient.charAt(0)}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base md:text-lg font-bold text-slate-800 uppercase truncate">
                        {patient.nom_patient} {patient.prenom_patient}
                      </h3>
                      <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200 shrink-0 flex items-center gap-1 uppercase">
                        <Hash size={10} /> {patient.num_dossier}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                      <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1 shrink-0">
                        <User size={12} className="text-cyan-500" />
                        {patient.sexe_patient === 'M' ? 'Masculin' : 'Féminin'} • {calculateAge(patient.date_naissance)} ans
                      </span>
                      <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1">
                        <MapPin size={12} className="text-cyan-500" />
                        <span className="truncate max-w-[150px] md:max-w-none">{patient.adresse_patient || 'Adresse non spécifiée'}</span>
                      </span>
                      <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1 shrink-0">
                        <Phone size={12} className="text-cyan-500" /> {patient.tel_patient || '-- -- --'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-4 md:gap-10 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <div className="flex flex-col text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enregistrement</p>
                    <div className="flex items-center gap-2 font-bold text-slate-700 text-xs md:text-sm italic">
                      <Clock size={14} className="text-cyan-500" />
                      {new Date(patient.date_enregistrement).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex items-center justify-end lg:justify-start">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all border border-transparent group-hover:border-cyan-100 flex items-center gap-2">
                      <span className="text-xs font-bold hidden md:block">Voir Dossier</span>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {processedPatients.length === 0
            ? 'Aucun patient'
            : `${(safePage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(safePage * ITEMS_PER_PAGE, processedPatients.length)} sur ${processedPatients.length} patient${processedPatients.length > 1 ? 's' : ''}`}
        </p>

        <div className="flex items-center gap-1.5">
          <button title="Page précédente" disabled={safePage === 1} onClick={() => changePage(safePage - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600">
            <ChevronLeft size={16} />
          </button>
          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`dots-${idx}`} className="w-6 text-center text-slate-400 text-xs font-bold select-none">…</span>
            ) : (
              <button key={page} onClick={() => changePage(page as number)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all border ${
                  safePage === page
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-100'
                    : 'border-slate-200 text-slate-600 hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700'
                }`}>
                {page}
              </button>
            )
          )}
          <button title="Page suivante" disabled={safePage === totalPages} onClick={() => changePage(safePage + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <AddPatientExterneModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPatient}
      />
    </div>
  );
}