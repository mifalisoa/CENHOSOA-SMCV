// backend/src/application/use-cases/admission/CreateAdmission.ts

import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { IPatientRepository } from '../../../domain/repositories/IPatientRepository';
import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { ILitRepository } from '../../../domain/repositories/ILitRepository';
import { CreateAdmissionDTO, Admission } from '../../../domain/entities/Admission';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class CreateAdmission {
    constructor(
        private admissionRepository: IAdmissionRepository,
        private patientRepository: IPatientRepository,
        private utilisateurRepository: IUtilisateurRepository,
        private litRepository: ILitRepository
    ) {}

    async execute(data: CreateAdmissionDTO): Promise<Admission> {
        const patient = await this.patientRepository.findById(data.id_patient);
        if (!patient) throw new NotFoundError('Patient');

        const docteur = await this.utilisateurRepository.findById(data.id_docteur);
        if (!docteur || docteur.role !== 'medecin' || docteur.statut !== 'actif') {
            throw new ValidationError('Médecin invalide ou inactif');
        }

        const secretaire = await this.utilisateurRepository.findById(data.id_secretaire);
        if (!secretaire || secretaire.role !== 'secretaire' || secretaire.statut !== 'actif') {
            throw new ValidationError('Secrétaire invalide ou inactif');
        }

        if (data.id_lit) {
            const isAvailable = await this.litRepository.isAvailable(data.id_lit);
            if (!isAvailable) throw new ValidationError("Ce lit n'est pas disponible");
        }

        const admission = await this.admissionRepository.create(data);

        if (data.id_lit) {
            await this.admissionRepository.assignLit(admission.id_admission, data.id_lit);
        }

        // ← 'hospitalisé' → 'hospitalise' (sans accent, cohérent avec la DB)
        await this.patientRepository.update(data.id_patient, { statut_patient: 'hospitalise' });

        return admission;
    }
}