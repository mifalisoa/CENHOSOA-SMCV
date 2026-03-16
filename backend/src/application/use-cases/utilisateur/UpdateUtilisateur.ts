// backend/src/application/use-cases/utilisateur/UpdateUtilisateur.ts

import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { UpdateUtilisateurDTO, UtilisateurWithoutPassword } from '../../../domain/entities/Utilisateur';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';
import { HTTP_STATUS } from '../../../config/constants';

export class UpdateUtilisateur {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(id: number, data: UpdateUtilisateurDTO): Promise<UtilisateurWithoutPassword> {
        const existing = await this.utilisateurRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Utilisateur');
        }

        // Si l'email est modifié, vérifier qu'il n'existe pas déjà
        if (data.email && data.email !== existing.email) {   // était data.email_user / existing.email_user
            const emailExists = await this.utilisateurRepository.emailExists(data.email, id);
            if (emailExists) {
                throw new AppError('Cet email est déjà utilisé', HTTP_STATUS.CONFLICT);
            }
        }

        const updated = await this.utilisateurRepository.update(id, data);
        if (!updated) {
            throw new NotFoundError('Utilisateur');
        }

        // Retourner sans le mot de passe — était mdp_user
        const { mot_de_passe, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }
}