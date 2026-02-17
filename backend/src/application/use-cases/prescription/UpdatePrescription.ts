import { IPrescriptionRepository } from '../../../domain/repositories/IPrescriptionRepository';
import { UpdatePrescriptionDTO, Prescription } from '../../../domain/entities/Prescription';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class UpdatePrescription {
    constructor(private prescriptionRepository: IPrescriptionRepository) {}

    async execute(id: number, data: UpdatePrescriptionDTO): Promise<Prescription> {
        // 1. Vérifier que la prescription existe
        const existing = await this.prescriptionRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Prescription');
        }

        // 2. Mettre à jour la prescription
        const updated = await this.prescriptionRepository.update(id, data);
        if (!updated) {
            throw new NotFoundError('Prescription');
        }

        return updated;
    }
}