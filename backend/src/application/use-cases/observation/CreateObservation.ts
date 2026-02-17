import { IObservationRepository } from '../../../domain/repositories/IObservationRepository';
import { Observation } from '../../../domain/entities/Observation';

export class CreateObservation {
  constructor(private observationRepository: IObservationRepository) {}

  async execute(observationData: Omit<Observation, 'id_observation' | 'created_at' | 'updated_at'>): Promise<Observation> {
    // Validation métier si nécessaire
    if (!observationData.medecin) {
      throw new Error('Le médecin est requis');
    }

    if (observationData.type_observation === 'hospitalise' && !observationData.id_admission) {
      throw new Error('L\'ID d\'admission est requis pour une observation d\'un patient hospitalisé');
    }

    return await this.observationRepository.create(observationData);
  }
}