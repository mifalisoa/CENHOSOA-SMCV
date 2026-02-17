import type { IPatientRepository } from '../../repositories/IPatientRepository';
import type { Patient } from '../../entities/Patient';

export class UpdatePatientUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id: number, patientData: Partial<Patient>): Promise<Patient> {
    return this.patientRepository.update(id, patientData);
  }
}