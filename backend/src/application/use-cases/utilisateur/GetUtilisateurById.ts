import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { UtilisateurWithoutPassword } from '../../../domain/entities/Utilisateur';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class GetUtilisateurById {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(id: number): Promise<UtilisateurWithoutPassword> {
        const user = await this.utilisateurRepository.findById(id);

        if (!user) {
            throw new NotFoundError('Utilisateur');
        }

        // Retourner sans le mot de passe
        const { mdp_user, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}