import { IEvolutionPatientRepository } from '../../../domain/repositories/IEvolutionPatientRepository';
import { EvolutionPatient } from '../../../domain/entities/EvolutionPatient';

export class GetEvolutionsByObservation {
  constructor(private evolutionRepository: IEvolutionPatientRepository) {}

  async execute(observationId: number): Promise<EvolutionPatient[]> {
    return await this.evolutionRepository.findByObservationId(observationId);
  }
}