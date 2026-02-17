import { ICompteRenduRepository } from '../../../domain/repositories/ICompteRenduRepository';
import { CompteRendu } from '../../../domain/entities/CompteRendu';

export class GetCompteRenduByAdmission {
  constructor(private compteRenduRepository: ICompteRenduRepository) {}

  async execute(admissionId: number): Promise<CompteRendu | null> {
    return await this.compteRenduRepository.findByAdmissionId(admissionId);
  }
}