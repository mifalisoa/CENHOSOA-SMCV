import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { PaginatedResponse, PaginationParams } from '../../../shared/types';
import { Admission } from '../../../domain/entities/Admission';

export class ListAdmissions {
    constructor(private admissionRepository: IAdmissionRepository) {}

    async execute(params: PaginationParams): Promise<PaginatedResponse<Admission>> {
        return this.admissionRepository.findAll(params);
    }
}