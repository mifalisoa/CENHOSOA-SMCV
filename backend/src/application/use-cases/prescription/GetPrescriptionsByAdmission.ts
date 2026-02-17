import { IPrescriptionRepository } from '../../../domain/repositories/IPrescriptionRepository';
import { Prescription } from '../../../domain/entities/Prescription';

export class GetPrescriptionsByAdmission {
    constructor(private prescriptionRepository: IPrescriptionRepository) {}

    async execute(idAdmission: number, type?: string): Promise<Prescription[]> {
        if (type) {
            return this.prescriptionRepository.findByType(idAdmission, type);
        }
        return this.prescriptionRepository.findByAdmission(idAdmission);
    }
}