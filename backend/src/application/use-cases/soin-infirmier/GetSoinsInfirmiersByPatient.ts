import { ISoinInfirmierRepository } from '../../../domain/repositories/ISoinInfirmierRepository';
import { SoinInfirmier } from '../../../domain/entities/SoinInfirmier';

export class GetSoinsInfirmiersByPatient {
  constructor(private soinRepository: ISoinInfirmierRepository) {}

  async execute(patientId: number): Promise<SoinInfirmier[]> {
    return await this.soinRepository.findByPatientId(patientId);
  }
}