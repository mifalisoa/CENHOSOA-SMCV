import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { Admission } from '../../../domain/entities/Admission';

export class GetAdmissionsEnCours {
    constructor(private admissionRepository: IAdmissionRepository) {}

    async execute(): Promise<Admission[]> {
        return this.admissionRepository.findEnCours();
    }
}
