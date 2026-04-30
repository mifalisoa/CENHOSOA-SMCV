import type { SoinMedical, CreateSoinMedicalDTO } from '../entities/SoinMedical';
import type { StatutValidation } from '../../shared/types';

export interface ISoinMedicalRepository {
  create(data: CreateSoinMedicalDTO): Promise<SoinMedical>;
  getByPatientId(patientId: number): Promise<SoinMedical[]>;
  getByAdmissionId(admissionId: number): Promise<SoinMedical[]>;
  getById(id: number): Promise<SoinMedical>;
  update(id: number, data: Partial<CreateSoinMedicalDTO>): Promise<SoinMedical>;
  /** @deprecated utiliser valider() */
  verify(id: number): Promise<SoinMedical>;
  valider(id: number, statut: StatutValidation): Promise<SoinMedical>;
  delete(id: number): Promise<void>;
}