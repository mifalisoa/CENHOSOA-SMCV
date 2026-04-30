import { SoinMedical } from '../entities/SoinMedical';
import { StatutValidation } from '../../shared/types';

type SoinMedicalCreate = Omit<SoinMedical, 'id_soin_medical' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde'>;

export interface ISoinMedicalRepository {
  create(soin: SoinMedicalCreate): Promise<SoinMedical>;
  findById(id: number): Promise<SoinMedical | null>;
  findByPatientId(patientId: number): Promise<SoinMedical[]>;
  findByAdmissionId(admissionId: number): Promise<SoinMedical[]>;
  findPendingByPatientId(patientId: number): Promise<SoinMedical[]>;
  update(id: number, soin: Partial<SoinMedical>): Promise<SoinMedical>;
  delete(id: number): Promise<void>;
  /** @deprecated Utiliser valider() */
  verify(id: number): Promise<SoinMedical>;
  valider(id: number, statut: StatutValidation, validateurId: number, modeGarde: boolean): Promise<SoinMedical>;
}