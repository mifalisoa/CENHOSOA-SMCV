import { ISoinInfirmierRepository } from '../../../domain/repositories/ISoinInfirmierRepository';
import { SoinInfirmier } from '../../../domain/entities/SoinInfirmier';

export class VerifySoinInfirmier {
  constructor(private soinRepository: ISoinInfirmierRepository) {}

  async execute(soinId: number): Promise<SoinInfirmier> {
    return await this.soinRepository.verify(soinId);
  }
}