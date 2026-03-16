// backend/src/application/use-cases/utilisateur/GetUtilisateurById.ts

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

        // Retourner sans le mot de passe — était mdp_user
        const { mot_de_passe, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}