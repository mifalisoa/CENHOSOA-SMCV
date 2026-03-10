import { useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../../../hooks/usePatients';

import type {  CreatePatientDTO } from '../../../../../core/entities/Patient';
import { AddPatientHospitaliseModal } from '../../../../components/patients/AddPatientHospitaliseModal';
import { 
  Search, Building2, MapPin, Phone, 
  User, ChevronRight, Plus, Filter, 
  ChevronLeft, Clock
} from 'lucide-react';

export default function PatientsHospitalises() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); 
  const [sortBy, setSortBy] = useState<'recent' | 'ancien'>('recent');
  const [filterSexe, setFilterSexe] = useState<'Tous' | 'M' | 'F'>('Tous');

  // Correction : On passe directement le statut au hook
  const { patients, loading, createPatient } = usePatients('hospitalise');

  const handleCreatePatient = async (data: CreatePatientDTO) => {
    await createPatient({ ...data, statut_patient: 'hospitalisé' });
    setIsAddModalOpen(false);
  };

  const calculateAge = (date: string | Date) => {
    if (!date) return '?';
    const birthDate = new Date(date);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return `${age} ans`;
  };

  const filteredData = useMemo(() => {
    const result = patients.filter((p) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = `${p.nom_patient} ${p.prenom_patient} ${p.num_dossier}`.toLowerCase().includes(search);
      const matchesSexe = filterSexe === 'Tous' || p.sexe_patient === filterSexe;
      return matchesSearch && matchesSexe;
    });

    return result.sort((a, b) => {
      const da = new Date(a.date_enregistrement).getTime();
      const db = new Date(b.date_enregistrement).getTime();
      return sortBy === 'recent' ? db - da : da - db;
    });
  }, [patients, searchTerm, filterSexe, sortBy]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPatients = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-10 px-0 sm:px-4">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Hospitalisations</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium italic">Suivi des patients admis au service</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-100 transition-all font-bold active:scale-95 w-full md:w-auto text-sm"
        >
          <Plus size={18} /> Nouvelle Admission
        </button>
      </div>

      <div className="bg-white p-2 md:p-3 rounded-2xl md:rounded-full border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center w-full">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro de dossier..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-full focus:ring-2 focus:ring-cyan-500/20 outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100 w-full md:w-auto overflow-x-auto">
          <Filter size={14} className="text-cyan-600 ml-3 shrink-0" />
          <select 
            title="Trier par date"
            className="bg-transparent text-[11px] md:text-xs font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-2"
            value={sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'recent' | 'ancien')}
          >
            <option value="recent">Admission : Récente</option>
            <option value="ancien">Admission : Ancienne</option>
          </select>
          <div className="w-px h-4 bg-slate-200" />
          <select 
            title="Filtrer par sexe"
            className="bg-transparent text-[11px] md:text-xs font-bold text-slate-600 outline-none cursor-pointer py-1.5 px-2"
            value={filterSexe}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterSexe(e.target.value as 'Tous' | 'M' | 'F')}
          >
            <option value="Tous">Tous Genres</option>
            <option value="M">Hommes</option>
            <option value="F">Femmes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentPatients.map((p) => (
          <div 
            key={p.id_patient}
            onClick={() => navigate(`/patients/${p.id_patient}/dossier`)}
            className="group relative bg-white border border-slate-100 p-4 md:p-6 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/5 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />

            <div className="flex items-center gap-4 flex-1 text-left">
              <div className="shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-lg md:text-2xl border border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                {p.nom_patient[0]}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base md:text-lg font-bold text-slate-800 uppercase truncate">
                    {p.nom_patient} {p.prenom_patient}
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200 shrink-0 uppercase">
                    #{p.num_dossier}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                  <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1 shrink-0">
                    <User size={12} className="text-cyan-500"/> {p.sexe_patient === 'M' ? 'Masculin' : 'Féminin'} • {calculateAge(p.date_naissance)}
                  </span>
                  <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-cyan-500"/> <span className="truncate max-w-[150px] md:max-w-none">{p.adresse_patient || 'Adresse non spécifiée'}</span>
                  </span>
                  <span className="text-[11px] md:text-xs font-semibold flex items-center gap-1 shrink-0">
                    <Phone size={12} className="text-cyan-500"/> {p.tel_patient || '-- -- --'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-row items-center gap-4 md:gap-10 border-t lg:border-t-0 pt-4 lg:pt-0">
              <div className="flex flex-col text-left lg:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-cyan-500" />
                    <span className="text-xs md:text-sm font-bold text-slate-700">Médecine Générale</span>
                  </div>
                  <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100 w-fit">Lit : 104-A</span>
                </div>
              </div>

              <div className="flex flex-col text-right lg:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admission</p>
                <div className="flex items-center justify-end lg:justify-start gap-2 font-bold text-slate-700 text-xs md:text-sm italic">
                  <Clock size={14} className="text-cyan-500" />
                  {new Date(p.date_enregistrement).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all border border-transparent group-hover:border-cyan-100">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Affichage de {currentPatients.length} sur {filteredData.length} patients
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              title="Précédent"
              disabled={currentPage === 1}
              onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev - 1); }}
              className="flex-1 sm:flex-none p-3 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 transition-all text-slate-600 flex justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              title="Suivant"
              disabled={currentPage === totalPages}
              onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }}
              className="flex-[2] sm:flex-none bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-100 hover:bg-cyan-700 disabled:opacity-30 transition-all text-sm"
            >
              Suivant <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <AddPatientHospitaliseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreatePatient}
      />
    </div>
  );
}