import type { CompteRendu, CreateCompteRenduDTO } from '../entities/CompteRendu';

export interface ICompteRenduRepository {
  create(data: CreateCompteRenduDTO): Promise<CompteRendu>;
  getByPatientId(patientId: number): Promise<CompteRendu[]>;
  getByAdmissionId(admissionId: number): Promise<CompteRendu | null>;
  getById(id: number): Promise<CompteRendu>;
  update(id: number, data: Partial<CreateCompteRenduDTO>): Promise<CompteRendu>;
  delete(id: number): Promise<void>;
}