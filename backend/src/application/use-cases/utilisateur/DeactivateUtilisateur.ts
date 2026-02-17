import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class DeactivateUtilisateur {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(id: number, currentUserId: number): Promise<void> {
        // 1. Empêcher un utilisateur de se désactiver lui-même
        if (id === currentUserId) {
            throw new ValidationError('Vous ne pouvez pas désactiver votre propre compte');
        }

        // 2. Vérifier que l'utilisateur existe
        const user = await this.utilisateurRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Utilisateur');
        }

        // 3. Vérifier qu'il n'est pas déjà désactivé
        if (!user.actif_user) {
            throw new ValidationError('Cet utilisateur est déjà désactivé');
        }

        // 4. Désactiver l'utilisateur
        await this.utilisateurRepository.deactivate(id);
    }
}