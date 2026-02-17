import { ISoinMedicalRepository } from '../../../domain/repositories/ISoinMedicalRepository';
import { SoinMedical } from '../../../domain/entities/SoinMedical';

export class GetSoinsMedicauxByPatient {
  constructor(private soinRepository: ISoinMedicalRepository) {}

  async execute(patientId: number): Promise<SoinMedical[]> {
    return await this.soinRepository.findByPatientId(patientId);
  }
}