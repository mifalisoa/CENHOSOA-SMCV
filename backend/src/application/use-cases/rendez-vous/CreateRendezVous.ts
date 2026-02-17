import { IRendezVousRepository } from '../../../domain/repositories/IRendezVousRepository';
import { IPatientRepository } from '../../../domain/repositories/IPatientRepository';
import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { CreateRendezVousDTO, RendezVous } from '../../../domain/entities/RendezVous';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { AppError } from '../../../shared/errors/AppError';
import { HTTP_STATUS } from '../../../config/constants';

export class CreateRendezVous {
    constructor(
        private rendezVousRepository: IRendezVousRepository,
        private patientRepository: IPatientRepository,
        private utilisateurRepository: IUtilisateurRepository
    ) {}

    async execute(data: CreateRendezVousDTO): Promise<RendezVous> {
        // 1. Vérifier que le patient existe
        const patient = await this.patientRepository.findById(data.id_patient);
        if (!patient) {
            throw new NotFoundError('Patient');
        }

        // 2. Vérifier que le docteur existe et est actif
        const docteur = await this.utilisateurRepository.findById(data.id_docteur);
        if (!docteur) {
            throw new NotFoundError('Docteur');
        }
        if (docteur.role_user !== 'docteur') {
            throw new ValidationError('L\'utilisateur spécifié n\'est pas un docteur');
        }
        if (!docteur.actif_user) {
            throw new ValidationError('Ce docteur n\'est pas actif');
        }

        // 3. Vérifier la disponibilité du créneau
        const isAvailable = await this.rendezVousRepository.checkAvailability(
            data.id_docteur,
            new Date(data.date_rdv),
            data.heure_rdv
        );

        if (!isAvailable) {
            throw new AppError(
                'Ce créneau n\'est pas disponible pour ce docteur',
                HTTP_STATUS.CONFLICT
            );
        }

        // 4. Vérifier que la date n'est pas dans le passé
        const rdvDate = new Date(`${data.date_rdv}T${data.heure_rdv}`);
        if (rdvDate < new Date()) {
            throw new ValidationError('Impossible de créer un rendez-vous dans le passé');
        }

        // 5. Créer le rendez-vous
        const rendezVous = await this.rendezVousRepository.create(data);

        return rendezVous;
    }
}