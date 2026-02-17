import type { IPatientRepository } from '../../repositories/IPatientRepository';
import type { Patient, CreatePatientDTO } from '../../entities/Patient';

export class CreatePatientUseCase {
  private patientRepository: IPatientRepository;

  constructor(patientRepository: IPatientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(patientData: CreatePatientDTO): Promise<Patient> {
    return this.patientRepository.create(patientData);
  }
}