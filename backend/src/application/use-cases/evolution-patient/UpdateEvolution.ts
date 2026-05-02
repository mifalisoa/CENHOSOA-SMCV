import { IEvolutionPatientRepository } from '../../../domain/repositories/IEvolutionPatientRepository';
import { EvolutionPatient, CreateEvolutionPatientDTO } from '../../../domain/entities/EvolutionPatient';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class UpdateEvolution {
  constructor(private evolutionRepository: IEvolutionPatientRepository) {}

  async execute(id: number, data: Partial<CreateEvolutionPatientDTO>): Promise<EvolutionPatient> {
    const existing = await this.evolutionRepository.findById(id);
    if (!existing) throw new NotFoundError('Évolution non trouvée');
    return await this.evolutionRepository.update(id, data);
  }
}