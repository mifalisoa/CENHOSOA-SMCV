// backend/src/application/use-cases/prescription/ValiderPrescription.ts

import { IPrescriptionRepository } from '../../../domain/repositories/IPrescriptionRepository';
import { Prescription, StatutPrescription } from '../../../domain/entities/Prescription';
import { ROLES_VALIDATEURS, RoleType } from '../../../shared/types';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export interface ValiderPrescriptionInput {
    id: number;
    statut: StatutPrescription;
    validateur_id: number;
    validateur_role: RoleType;
    mode_garde: boolean;
}

export class ValiderPrescription {
    constructor(private prescriptionRepository: IPrescriptionRepository) {}

    async execute(input: ValiderPrescriptionInput): Promise<Prescription> {
        if (!ROLES_VALIDATEURS.includes(input.validateur_role)) {
            throw new Error('Seul un médecin peut valider une prescription');
        }

        const prescription = await this.prescriptionRepository.findById(input.id);
        if (!prescription) {
            throw new NotFoundError('Prescription');
        }

        if (prescription.statut !== 'en_attente' && !input.mode_garde) {
            throw new Error(`Cette prescription est déjà ${prescription.statut} et ne peut plus être modifiée`);
        }

        const updated = await this.prescriptionRepository.valider(
            input.id,
            input.statut,
            input.validateur_id,
            input.mode_garde,
        );
        if (!updated) throw new NotFoundError('Prescription');
        return updated;
    }
}