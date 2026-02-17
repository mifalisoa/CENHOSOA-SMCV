import type { Traitement, CreateTraitementDTO } from '../entities/Traitement';

export interface ITraitementRepository {
  create(data: CreateTraitementDTO): Promise<Traitement>;
  getByPatientId(patientId: number): Promise<Traitement[]>;
  getByAdmissionId(admissionId: number): Promise<Traitement[]>;
  getById(id: number): Promise<Traitement>;
  update(id: number, data: Partial<CreateTraitementDTO>): Promise<Traitement>;
  delete(id: number): Promise<void>;
}