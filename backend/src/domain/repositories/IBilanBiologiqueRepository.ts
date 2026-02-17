import { BilanBiologique } from '../entities/BilanBiologique';

export interface IBilanBiologiqueRepository {
  create(bilan: Omit<BilanBiologique, 'id_bilan' | 'created_at' | 'updated_at'>): Promise<BilanBiologique>;
  findById(id: number): Promise<BilanBiologique | null>;
  findByPatientId(patientId: number): Promise<BilanBiologique[]>;
  findByAdmissionId(admissionId: number): Promise<BilanBiologique[]>;
  update(id: number, bilan: Partial<BilanBiologique>): Promise<BilanBiologique>;
  delete(id: number): Promise<void>;
}