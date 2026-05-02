import type { EvolutionPatient, CreateEvolutionPatientDTO } from '../entities/EvolutionPatient';

export interface IEvolutionPatientRepository {
  create(data: CreateEvolutionPatientDTO): Promise<EvolutionPatient>;
  getByPatientId(patientId: number): Promise<EvolutionPatient[]>;
  getByObservationId(observationId: number): Promise<EvolutionPatient[]>;
  getById(id: number): Promise<EvolutionPatient>;
  update(id: number, data: Partial<CreateEvolutionPatientDTO>): Promise<EvolutionPatient>;
  delete(id: number): Promise<void>;
}