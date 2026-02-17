import { IBilanBiologiqueRepository } from '../../../domain/repositories/IBilanBiologiqueRepository';
import { BilanBiologique } from '../../../domain/entities/BilanBiologique';

export class GetBilansByAdmission {
  constructor(private bilanRepository: IBilanBiologiqueRepository) {}

  async execute(admissionId: number): Promise<BilanBiologique[]> {
    return await this.bilanRepository.findByAdmissionId(admissionId);
  }
}