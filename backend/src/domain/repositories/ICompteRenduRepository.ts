import { CompteRendu } from '../entities/CompteRendu';

export interface ICompteRenduRepository {
  create(compteRendu: Omit<CompteRendu, 'id_compte_rendu' | 'created_at' | 'updated_at'>): Promise<CompteRendu>;
  findById(id: number): Promise<CompteRendu | null>;
  findByPatientId(patientId: number): Promise<CompteRendu[]>;
  findByAdmissionId(admissionId: number): Promise<CompteRendu | null>;
  update(id: number, compteRendu: Partial<CompteRendu>): Promise<CompteRendu>;
  delete(id: number): Promise<void>;
}