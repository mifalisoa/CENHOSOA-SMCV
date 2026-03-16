// backend/src/application/use-cases/utilisateur/ActivateUtilisateur.ts

import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class ActivateUtilisateur {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(id: number): Promise<void> {
        const user = await this.utilisateurRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Utilisateur');
        }

        if (user.statut === 'actif') {          // était user.actif_user
            throw new ValidationError('Cet utilisateur est déjà actif');
        }

        await this.utilisateurRepository.activate(id);
    }
}