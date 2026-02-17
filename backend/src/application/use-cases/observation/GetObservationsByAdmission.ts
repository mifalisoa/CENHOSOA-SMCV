import { IObservationRepository } from '../../../domain/repositories/IObservationRepository';
import { Observation } from '../../../domain/entities/Observation';

export class GetObservationsByAdmission {
  constructor(private observationRepository: IObservationRepository) {}

  async execute(admissionId: number): Promise<Observation[]> {
    return await this.observationRepository.findByAdmissionId(admissionId);
  }
}