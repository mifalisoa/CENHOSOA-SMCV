import type { IPatientRepository, PaginatedResponse } from '../../repositories/IPatientRepository';
import type { Patient } from '../../entities/Patient';

export class GetPatientsUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Patient>> {
    return this.patientRepository.getAll(page, limit);
  }
}