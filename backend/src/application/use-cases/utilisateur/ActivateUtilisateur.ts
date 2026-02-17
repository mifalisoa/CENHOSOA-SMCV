import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class ActivateUtilisateur {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(id: number): Promise<void> {
        // 1. Vérifier que l'utilisateur existe
        const user = await this.utilisateurRepository.findById(id);
        if (!user) {
            throw new NotFoundError('Utilisateur');
        }

        // 2. Vérifier qu'il n'est pas déjà actif
        if (user.actif_user) {
            throw new ValidationError('Cet utilisateur est déjà actif');
        }

        // 3. Activer l'utilisateur
        await this.utilisateurRepository.activate(id);
    }
}