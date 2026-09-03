import { ICompteRenduConsultationRepository } from '../../../domain/repositories/ICompteRenduConsultationRepository';
import { CompteRenduConsultation } from '../../../domain/entities/CompteRenduConsultation';

export class GetComptesRendusConsultationByPatient {
  constructor(private repository: ICompteRenduConsultationRepository) {}

  async execute(patientId: number): Promise<CompteRenduConsultation[]> {
    return await this.repository.findByPatientId(patientId);
  }
}