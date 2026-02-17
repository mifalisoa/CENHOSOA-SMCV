import { IBilanBiologiqueRepository } from '../../../domain/repositories/IBilanBiologiqueRepository';
import { BilanBiologique } from '../../../domain/entities/BilanBiologique';

export class GetBilansByPatient {
  constructor(private bilanRepository: IBilanBiologiqueRepository) {}

  async execute(patientId: number): Promise<BilanBiologique[]> {
    return await this.bilanRepository.findByPatientId(patientId);
  }
}