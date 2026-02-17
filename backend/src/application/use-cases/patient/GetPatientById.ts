import { IPatientRepository } from '../../../domain/repositories/IPatientRepository';
import { Patient } from '../../../domain/entities/Patient';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class GetPatientById {
    constructor(private patientRepository: IPatientRepository) {}

    async execute(id: number): Promise<Patient> {
        const patient = await this.patientRepository.findById(id);
        
        if (!patient) {
            throw new NotFoundError('Patient');
        }

        return patient;
    }
}