import { ICompteRenduRepository } from '../../../domain/repositories/ICompteRenduRepository';
import { CompteRendu } from '../../../domain/entities/CompteRendu';

export class GetComptesRendusByPatient {
  constructor(private compteRenduRepository: ICompteRenduRepository) {}

  async execute(patientId: number): Promise<CompteRendu[]> {
    return await this.compteRenduRepository.findByPatientId(patientId);
  }
}