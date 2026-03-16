// backend/src/application/use-cases/utilisateur/DeactivateUtilisateur.ts

import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class DeactivateUtilisateur {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(id: number, currentUserId: number): Promise<void> {
        if (id === currentUserId) {
            throw new ValidationError('Vous ne pouvez pas désactiver votre propre compte');
        }

        const user = await this.utilisateurRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Utilisateur');
        }

        if (user.statut !== 'actif') {          // était !user.actif_user
            throw new ValidationError('Cet utilisateur est déjà désactivé');
        }

        await this.utilisateurRepository.deactivate(id);
    }
}