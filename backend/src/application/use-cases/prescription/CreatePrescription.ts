import { IPrescriptionRepository } from '../../../domain/repositories/IPrescriptionRepository';
import { IAdmissionRepository } from '../../../domain/repositories/IAdmissionRepository';
import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { CreatePrescriptionDTO, Prescription } from '../../../domain/entities/Prescription';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class CreatePrescription {
    constructor(
        private prescriptionRepository: IPrescriptionRepository,
        private admissionRepository: IAdmissionRepository,
        private utilisateurRepository: IUtilisateurRepository
    ) {}

    async execute(data: CreatePrescriptionDTO): Promise<Prescription> {
        // 1. Vérifier que l'admission existe et est en cours
        const admission = await this.admissionRepository.findById(data.id_admission);
        if (!admission) {
            throw new NotFoundError('Admission');
        }
        if (admission.statut_admission !== 'en_cours') {
            throw new ValidationError('Impossible de prescrire pour une admission clôturée');
        }

        // 2. Vérifier que le docteur existe et est actif
        const docteur = await this.utilisateurRepository.findById(data.id_docteur);
        if (!docteur || docteur.role_user !== 'docteur' || !docteur.actif_user) {
            throw new ValidationError('Docteur invalide ou inactif');
        }

        // 3. Créer la prescription
        const prescription = await this.prescriptionRepository.create(data);

        return prescription;
    }
}