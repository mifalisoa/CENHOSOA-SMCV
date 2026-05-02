import { IEvolutionPatientRepository } from '../../../domain/repositories/IEvolutionPatientRepository';
import { EvolutionPatient } from '../../../domain/entities/EvolutionPatient';

export class GetEvolutionsByPatient {
  constructor(private evolutionRepository: IEvolutionPatientRepository) {}

  async execute(patientId: number): Promise<EvolutionPatient[]> {
    return await this.evolutionRepository.findByPatientId(patientId);
  }
}