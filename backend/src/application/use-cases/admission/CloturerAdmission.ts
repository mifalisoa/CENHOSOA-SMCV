import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { IPatientRepository } from '../../../domain/repositories/IPatientRepository';
import { ILitRepository } from '../../../domain/repositories/ILitRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class CloturerAdmission {
    constructor(
        private admissionRepository: IAdmissionRepository,
        private patientRepository: IPatientRepository,
        private litRepository: ILitRepository
    ) {}

    async execute(idAdmission: number): Promise<void> {
        // 1. Vérifier que l'admission existe
        const admission = await this.admissionRepository.findById(idAdmission);
        if (!admission) {
            throw new NotFoundError('Admission');
        }

        // 2. Vérifier que l'admission est en cours
        if (admission.statut_admission !== 'en_cours') {
            throw new ValidationError('Cette admission est déjà clôturée');
        }

        // 3. Libérer le lit si assigné
        if (admission.id_lit) {
            await this.litRepository.updateStatus(admission.id_lit, 'disponible');
        }

        // 4. Clôturer l'admission
        await this.admissionRepository.cloturer(idAdmission);

        // 5. Mettre à jour le statut du patient
        await this.patientRepository.update(admission.id_patient, { statut_patient: 'sorti' });
    }
}