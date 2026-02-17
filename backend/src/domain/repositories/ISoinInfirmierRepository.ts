import { SoinInfirmier } from '../entities/SoinInfirmier';

export interface ISoinInfirmierRepository {
  create(soin: Omit<SoinInfirmier, 'id_soin_infirmier' | 'created_at' | 'updated_at'>): Promise<SoinInfirmier>;
  findById(id: number): Promise<SoinInfirmier | null>;
  findByPatientId(patientId: number): Promise<SoinInfirmier[]>;
  findByAdmissionId(admissionId: number): Promise<SoinInfirmier[]>;
  update(id: number, soin: Partial<SoinInfirmier>): Promise<SoinInfirmier>;
  delete(id: number): Promise<void>;
  verify(id: number): Promise<SoinInfirmier>;
}