import type { Observation, CreateObservationDTO } from '../entities/Observation';

export interface IObservationRepository {
  create(data: CreateObservationDTO): Promise<Observation>;
  getByPatientId(patientId: number, type?: 'externe' | 'hospitalise'): Promise<Observation[]>;
  getByAdmissionId(admissionId: number): Promise<Observation[]>;
  getById(id: number): Promise<Observation>;
  update(id: number, data: Partial<CreateObservationDTO>): Promise<Observation>;
  delete(id: number): Promise<void>;
}