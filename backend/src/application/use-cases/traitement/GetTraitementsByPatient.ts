import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement } from '../../../domain/entities/Traitement';

export class GetTraitementsByPatient {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(patientId: number): Promise<Traitement[]> {
    return await this.traitementRepository.findByPatientId(patientId);
  }
}