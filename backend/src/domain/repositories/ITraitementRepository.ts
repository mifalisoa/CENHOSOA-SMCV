import { Traitement } from '../entities/Traitement';

export interface ITraitementRepository {
  create(traitement: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at'>): Promise<Traitement>;
  findById(id: number): Promise<Traitement | null>;
  findByPatientId(patientId: number): Promise<Traitement[]>;
  findByAdmissionId(admissionId: number): Promise<Traitement[]>;
  update(id: number, traitement: Partial<Traitement>): Promise<Traitement>;
  delete(id: number): Promise<void>;
}