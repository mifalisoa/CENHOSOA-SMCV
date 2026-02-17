import { IPatientRepository } from '../../../domain/repositories/IPatientRepository';
import { CreatePatientDTO, Patient } from '../../../domain/entities/Patient';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { AppError } from '../../../shared/errors/AppError';
import { HTTP_STATUS } from '../../../config/constants';

export class CreatePatient {
    constructor(private patientRepository: IPatientRepository) {}

    async execute(data: CreatePatientDTO): Promise<Patient> {
        // 1. Vérifier si le numéro de dossier existe déjà
        const numDossierExists = await this.patientRepository.numDossierExists(data.num_dossier);
        if (numDossierExists) {
            throw new AppError('Ce numéro de dossier existe déjà', HTTP_STATUS.CONFLICT);
        }

        // 2. Valider l'âge (optionnel mais recommandé)
        const birthDate = new Date(data.date_naissance);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age > 150 || age < 0) {
            throw new ValidationError('Date de naissance invalide');
        }

        // 3. Créer le patient
        const patient = await this.patientRepository.create(data);

        return patient;
    }
}