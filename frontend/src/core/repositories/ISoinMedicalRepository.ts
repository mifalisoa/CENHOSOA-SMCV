import type { SoinMedical, CreateSoinMedicalDTO } from '../entities/SoinMedical';

export interface ISoinMedicalRepository {
  create(data: CreateSoinMedicalDTO): Promise<SoinMedical>;
  getByPatientId(patientId: number): Promise<SoinMedical[]>;
  getByAdmissionId(admissionId: number): Promise<SoinMedical[]>;
  getById(id: number): Promise<SoinMedical>;
  update(id: number, data: Partial<CreateSoinMedicalDTO>): Promise<SoinMedical>;
  verify(id: number): Promise<SoinMedical>;
  delete(id: number): Promise<void>;
}