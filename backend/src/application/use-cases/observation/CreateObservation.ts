import { IObservationRepository } from '../../../domain/repositories/IObservationRepository';
import { Observation } from '../../../domain/entities/Observation';

export class CreateObservation {
  constructor(private observationRepository: IObservationRepository) {}

  async execute(observationData: Omit<Observation, 'id_observation' | 'created_at' | 'updated_at'>): Promise<Observation> {
    if (!observationData.medecin) {
      throw new Error('Le médecin est requis');
    }

    // id_admission optionnel — une observation peut exister sans admission formelle
    
    return await this.observationRepository.create(observationData);
  }
}