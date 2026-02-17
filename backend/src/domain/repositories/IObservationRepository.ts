import { Observation } from '../entities/Observation';

export interface IObservationRepository {
  create(observation: Omit<Observation, 'id_observation' | 'created_at' | 'updated_at'>): Promise<Observation>;
  findById(id: number): Promise<Observation | null>;
  findByPatientId(patientId: number, type?: 'externe' | 'hospitalise'): Promise<Observation[]>;
  findByAdmissionId(admissionId: number): Promise<Observation[]>;
  update(id: number, observation: Partial<Observation>): Promise<Observation>;
  delete(id: number): Promise<void>;
}