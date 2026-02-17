import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement } from '../../../domain/entities/Traitement';

export class GetTraitementsByAdmission {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(admissionId: number): Promise<Traitement[]> {
    return await this.traitementRepository.findByAdmissionId(admissionId);
  }
}