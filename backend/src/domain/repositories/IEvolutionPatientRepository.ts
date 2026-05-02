import { EvolutionPatient, CreateEvolutionPatientDTO } from '../entities/EvolutionPatient';

export interface IEvolutionPatientRepository {
  create(data: Omit<EvolutionPatient, 'id_evolution' | 'created_at' | 'updated_at'>): Promise<EvolutionPatient>;
  findById(id: number): Promise<EvolutionPatient | null>;
  findByPatientId(patientId: number): Promise<EvolutionPatient[]>;
  findByObservationId(observationId: number): Promise<EvolutionPatient[]>;
  update(id: number, data: Partial<CreateEvolutionPatientDTO>): Promise<EvolutionPatient>;
  delete(id: number): Promise<void>;
}