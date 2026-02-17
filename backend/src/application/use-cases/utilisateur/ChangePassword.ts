import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { BcryptService } from '../../../infrastructure/security/bcrypt.service';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';

export class ChangePassword {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(userId: number, currentPassword: string, newPassword: string): Promise<void> {
        // 1. Vérifier que l'utilisateur existe
        const user = await this.utilisateurRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('Utilisateur');
        }

        // 2. Vérifier le mot de passe actuel
        const isPasswordValid = await BcryptService.compare(currentPassword, user.mdp_user);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Mot de passe actuel incorrect');
        }

        // 3. Valider le nouveau mot de passe
        const passwordValidation = BcryptService.validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            throw new ValidationError(passwordValidation.message!);
        }

        // 4. Hasher et mettre à jour le mot de passe
        const hashedPassword = await BcryptService.hash(newPassword);
        await this.utilisateurRepository.updatePassword(userId, hashedPassword);
    }
}