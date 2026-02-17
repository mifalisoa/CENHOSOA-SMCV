import { SoinMedical } from '../entities/SoinMedical';

export interface ISoinMedicalRepository {
  create(soin: Omit<SoinMedical, 'id_soin_medical' | 'created_at' | 'updated_at'>): Promise<SoinMedical>;
  findById(id: number): Promise<SoinMedical | null>;
  findByPatientId(patientId: number): Promise<SoinMedical[]>;
  findByAdmissionId(admissionId: number): Promise<SoinMedical[]>;
  update(id: number, soin: Partial<SoinMedical>): Promise<SoinMedical>;
  delete(id: number): Promise<void>;
  verify(id: number): Promise<SoinMedical>;
}