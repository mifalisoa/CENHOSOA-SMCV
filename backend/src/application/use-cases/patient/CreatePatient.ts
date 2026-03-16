// backend/src/application/use-cases/patient/CreatePatient.ts

import { IPatientRepository } from '../../../domain/repositories/IPatientRepository';
import { CreatePatientDTO, Patient } from '../../../domain/entities/Patient';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class CreatePatient {
    constructor(private patientRepository: IPatientRepository) {}

    async execute(data: CreatePatientDTO): Promise<Patient> {
        // 1. Valider la date de naissance
        const birthDate = new Date(data.date_naissance);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (isNaN(birthDate.getTime()) || age > 150 || age < 0) {
            throw new ValidationError('Date de naissance invalide');
        }

        // 2. Créer le patient
        // num_dossier est généré automatiquement côté base de données
        const patient = await this.patientRepository.create(data);

        return patient;
    }
}