import type { SoinInfirmier, CreateSoinInfirmierDTO } from '../entities/SoinInfirmier';
import type { StatutValidation } from '../../shared/types';

export interface ISoinInfirmierRepository {
  create(data: CreateSoinInfirmierDTO): Promise<SoinInfirmier>;
  getByPatientId(patientId: number): Promise<SoinInfirmier[]>;
  getByAdmissionId(admissionId: number): Promise<SoinInfirmier[]>;
  getById(id: number): Promise<SoinInfirmier>;
  update(id: number, data: Partial<CreateSoinInfirmierDTO>): Promise<SoinInfirmier>;
  /** @deprecated utiliser valider() */
  verify(id: number): Promise<SoinInfirmier>;
  valider(id: number, statut: StatutValidation): Promise<SoinInfirmier>;
  delete(id: number): Promise<void>;
}