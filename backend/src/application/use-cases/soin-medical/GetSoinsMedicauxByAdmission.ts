import { ISoinMedicalRepository } from '../../../domain/repositories/ISoinMedicalRepository';
import { SoinMedical } from '../../../domain/entities/SoinMedical';

export class GetSoinsMedicauxByAdmission {
  constructor(private soinRepository: ISoinMedicalRepository) {}

  async execute(admissionId: number): Promise<SoinMedical[]> {
    return await this.soinRepository.findByAdmissionId(admissionId);
  }
}