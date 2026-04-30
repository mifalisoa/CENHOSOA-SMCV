import { SoinInfirmier } from '../entities/SoinInfirmier';
import { StatutValidation } from '../../shared/types';

type SoinInfirmierCreate = Omit<SoinInfirmier, 'id_soin_infirmier' | 'created_at' | 'updated_at' | 'statut' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde'>;

export interface ISoinInfirmierRepository {
  create(soin: SoinInfirmierCreate): Promise<SoinInfirmier>;
  findById(id: number): Promise<SoinInfirmier | null>;
  findByPatientId(patientId: number): Promise<SoinInfirmier[]>;
  findByAdmissionId(admissionId: number): Promise<SoinInfirmier[]>;
  findPendingByPatientId(patientId: number): Promise<SoinInfirmier[]>;
  update(id: number, soin: Partial<SoinInfirmier>): Promise<SoinInfirmier>;
  delete(id: number): Promise<void>;
  /** @deprecated Utiliser valider() */
  verify(id: number): Promise<SoinInfirmier>;
  valider(id: number, statut: StatutValidation, validateurId: number, modeGarde: boolean): Promise<SoinInfirmier>;
}