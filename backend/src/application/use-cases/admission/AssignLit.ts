import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { ILitRepository } from '../../../domain/repositories/ILitRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class AssignLit {
    constructor(
        private admissionRepository: IAdmissionRepository,
        private litRepository: ILitRepository
    ) {}

    async execute(idAdmission: number, idLit: number): Promise<void> {
        // 1. Vérifier que l'admission existe
        const admission = await this.admissionRepository.findById(idAdmission);
        if (!admission) {
            throw new NotFoundError('Admission');
        }

        // 2. Vérifier que l'admission est en cours
        if (admission.statut_admission !== 'en_cours') {
            throw new ValidationError('Seule une admission en cours peut recevoir un lit');
        }

        // 3. Vérifier que le lit est disponible
        const isAvailable = await this.litRepository.isAvailable(idLit);
        if (!isAvailable) {
            throw new ValidationError('Ce lit n\'est pas disponible');
        }

        // 4. Si l'admission avait déjà un lit, le libérer
        if (admission.id_lit) {
            await this.litRepository.updateStatus(admission.id_lit, 'disponible');
        }

        // 5. Assigner le nouveau lit
        await this.admissionRepository.assignLit(idAdmission, idLit);
    }
}