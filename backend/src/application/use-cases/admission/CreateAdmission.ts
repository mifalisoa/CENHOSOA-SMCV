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
        // 1. Vérifier que le patient existe
        const patient = await this.patientRepository.findById(data.id_patient);
        if (!patient) {
            throw new NotFoundError('Patient');
        }

        // 2. Vérifier que le docteur existe et est actif
        const docteur = await this.utilisateurRepository.findById(data.id_docteur);
        if (!docteur || docteur.role_user !== 'docteur' || !docteur.actif_user) {
            throw new ValidationError('Docteur invalide ou inactif');
        }

        // 3. Vérifier que le secrétaire existe et est actif
        const secretaire = await this.utilisateurRepository.findById(data.id_secretaire);
        if (!secretaire || secretaire.role_user !== 'secretaire' || !secretaire.actif_user) {
            throw new ValidationError('Secrétaire invalide ou inactif');
        }

        // 4. Si un lit est spécifié, vérifier qu'il est disponible
        if (data.id_lit) {
            const isAvailable = await this.litRepository.isAvailable(data.id_lit);
            if (!isAvailable) {
                throw new ValidationError('Ce lit n\'est pas disponible');
            }
        }

        // 5. Créer l'admission
        const admission = await this.admissionRepository.create(data);

        // 6. Si un lit est assigné, mettre à jour son statut
        if (data.id_lit) {
            await this.admissionRepository.assignLit(admission.id_admission, data.id_lit);
        }

        // 7. Mettre à jour le statut du patient
        await this.patientRepository.update(data.id_patient, { statut_patient: 'hospitalise' });

        return admission;
    }
}