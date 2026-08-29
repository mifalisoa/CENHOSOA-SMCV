// backend/src/application/use-cases/prescription/CreatePrescription.ts

import { IPrescriptionRepository } from '../../../domain/repositories/IPrescriptionRepository';
import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { CreatePrescriptionDTO, Prescription } from '../../../domain/entities/Prescription';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { ROLES_NECESSITANT_VALIDATION, RoleType } from '../../../shared/types';

export interface CreatePrescriptionInput extends CreatePrescriptionDTO {
    role_createur?: RoleType;
}

export class CreatePrescription {
    constructor(
        private prescriptionRepository: IPrescriptionRepository,
        private admissionRepository: IAdmissionRepository,
        private utilisateurRepository: IUtilisateurRepository
    ) {}

    async execute(data: CreatePrescriptionInput): Promise<Prescription> {
        const admission = await this.admissionRepository.findById(data.id_admission);
        if (!admission) {
            throw new NotFoundError('Admission');
        }
        if (admission.statut_admission !== 'en_cours') {
            throw new ValidationError('Impossible de prescrire pour une admission clôturée');
        }

        // Le docteur reference peut etre un medecin ou un admin (qui agit aussi comme medecin)
        const docteur = await this.utilisateurRepository.findById(data.id_docteur);
        const roleDocteurValide = docteur?.role === 'medecin' || docteur?.role === 'admin';
        if (!docteur || !roleDocteurValide || docteur.statut !== 'actif') {
            throw new ValidationError('Médecin invalide ou inactif');
        }

        // Statut initial selon le role de la personne qui SAISIT (pas forcement le docteur reference)
        const necessiteValidation =
            data.role_createur !== undefined &&
            ROLES_NECESSITANT_VALIDATION.includes(data.role_createur);
        const statutInitial = necessiteValidation ? 'en_attente' : 'valide';

        return await this.prescriptionRepository.create({
    ...data,
    statut: statutInitial,
});
    }
}