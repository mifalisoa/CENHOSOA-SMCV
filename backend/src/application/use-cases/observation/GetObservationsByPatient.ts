import { IObservationRepository } from '../../../domain/repositories/IObservationRepository';
import { Observation } from '../../../domain/entities/Observation';

export class GetObservationsByPatient {
  constructor(private observationRepository: IObservationRepository) {}

  async execute(patientId: number, type?: 'externe' | 'hospitalise'): Promise<Observation[]> {
    return await this.observationRepository.findByPatientId(patientId, type);
  }
}