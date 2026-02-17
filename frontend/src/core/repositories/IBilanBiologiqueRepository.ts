import type { BilanBiologique, CreateBilanBiologiqueDTO } from '../entities/BilanBiologique';

export interface IBilanBiologiqueRepository {
  create(data: CreateBilanBiologiqueDTO): Promise<BilanBiologique>;
  getByPatientId(patientId: number): Promise<BilanBiologique[]>;
  getByAdmissionId(admissionId: number): Promise<BilanBiologique[]>;
  getById(id: number): Promise<BilanBiologique>;
  update(id: number, data: Partial<CreateBilanBiologiqueDTO>): Promise<BilanBiologique>;
  delete(id: number): Promise<void>;
}