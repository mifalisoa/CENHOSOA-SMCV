import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { Admission } from '../../../domain/entities/Admission';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class GetAdmissionById {
    constructor(private admissionRepository: IAdmissionRepository) {}

    async execute(id: number): Promise<Admission> {
        const admission = await this.admissionRepository.findById(id);

        if (!admission) {
            throw new NotFoundError('Admission');
        }

        return admission;
    }
}