import type { SoinInfirmier, CreateSoinInfirmierDTO } from '../entities/SoinInfirmier';

export interface ISoinInfirmierRepository {
  create(data: CreateSoinInfirmierDTO): Promise<SoinInfirmier>;
  getByPatientId(patientId: number): Promise<SoinInfirmier[]>;
  getByAdmissionId(admissionId: number): Promise<SoinInfirmier[]>;
  getById(id: number): Promise<SoinInfirmier>;
  update(id: number, data: Partial<CreateSoinInfirmierDTO>): Promise<SoinInfirmier>;
  verify(id: number): Promise<SoinInfirmier>;
  delete(id: number): Promise<void>;
}