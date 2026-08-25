import { Traitement } from '../entities/Traitement';
import { StatutValidation } from '../../shared/types';

type TraitementCreate = Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde'>;

export interface ITraitementRepository {
  create(traitement: TraitementCreate): Promise<Traitement>;
  createMany(traitements: TraitementCreate[]): Promise<Traitement[]>;
  findById(id: number): Promise<Traitement | null>;
  findByPatientId(patientId: number): Promise<Traitement[]>;
  findByAdmissionId(admissionId: number): Promise<Traitement[]>;
  findByOrdonnanceId(ordonnanceId: string): Promise<Traitement[]>;
  findPendingByPatientId(patientId: number): Promise<Traitement[]>;
  update(id: number, traitement: Partial<Traitement>): Promise<Traitement>;
  delete(id: number): Promise<void>;
  valider(id: number, statut: StatutValidation, validateurId: number, modeGarde: boolean): Promise<Traitement>;
}