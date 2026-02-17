import { ISoinMedicalRepository } from '../../../domain/repositories/ISoinMedicalRepository';
import { SoinMedical } from '../../../domain/entities/SoinMedical';

export class VerifySoinMedical {
  constructor(private soinRepository: ISoinMedicalRepository) {}

  async execute(soinId: number): Promise<SoinMedical> {
    return await this.soinRepository.verify(soinId);
  }
}