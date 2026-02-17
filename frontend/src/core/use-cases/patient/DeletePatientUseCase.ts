import type { IPatientRepository } from '../../repositories/IPatientRepository';

export class DeletePatientUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id: number): Promise<void> {
    return this.patientRepository.delete(id);
  }
}