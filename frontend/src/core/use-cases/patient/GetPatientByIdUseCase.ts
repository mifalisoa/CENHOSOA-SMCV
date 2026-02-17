import type { IPatientRepository } from '../../repositories/IPatientRepository';
import type { Patient } from '../../entities/Patient';

export class GetPatientByIdUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id: number): Promise<Patient> {
    return this.patientRepository.getById(id);
  }
}