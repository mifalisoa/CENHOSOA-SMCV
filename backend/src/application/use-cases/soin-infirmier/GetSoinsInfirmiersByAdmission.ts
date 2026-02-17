import { ISoinInfirmierRepository } from '../../../domain/repositories/ISoinInfirmierRepository';
import { SoinInfirmier } from '../../../domain/entities/SoinInfirmier';

export class GetSoinsInfirmiersByAdmission {
  constructor(private soinRepository: ISoinInfirmierRepository) {}

  async execute(admissionId: number): Promise<SoinInfirmier[]> {
    return await this.soinRepository.findByAdmissionId(admissionId);
  }
}