// backend/src/application/use-cases/utilisateur/ChangePassword.ts

import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { BcryptService } from '../../../infrastructure/security/bcrypt.service';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';

export class ChangePassword {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(userId: number, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.utilisateurRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('Utilisateur');
        }

        const isPasswordValid = await BcryptService.compare(currentPassword, user.mot_de_passe); // était mdp_user
        if (!isPasswordValid) {
            throw new UnauthorizedError('Mot de passe actuel incorrect');
        }

        const passwordValidation = BcryptService.validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            throw new ValidationError(passwordValidation.message!);
        }

        const hashedPassword = await BcryptService.hash(newPassword);
        await this.utilisateurRepository.updatePassword(userId, hashedPassword);
    }
}