import { IPatientRepository } from '../../../domain/repositories/IPatientRepository';
import { PaginatedResponse, PaginationParams } from '../../../shared/types';
import { Patient } from '../../../domain/entities/Patient';

export class ListPatients {
    constructor(private patientRepository: IPatientRepository) {}

    async execute(params: PaginationParams): Promise<PaginatedResponse<Patient>> {
        return this.patientRepository.findAll(params);
    }
}