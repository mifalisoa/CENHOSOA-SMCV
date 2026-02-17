import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { CreateUtilisateurDTO } from '../../../domain/entities/Utilisateur';
import { BcryptService } from '../../../infrastructure/security/bcrypt.service';
import { ValidationError } from '../../../shared/errors/ValidationError';
import { AppError } from '../../../shared/errors/AppError';
import { HTTP_STATUS } from '../../../config/constants';

export class RegisterUser {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(data: CreateUtilisateurDTO): Promise<{ id_user: number; email_user: string }> {
        // 1. Valider la force du mot de passe
        const passwordValidation = BcryptService.validatePasswordStrength(data.mdp_user);
        if (!passwordValidation.valid) {
            throw new ValidationError(passwordValidation.message!);
        }

        // 2. Vérifier si l'email existe déjà
        const emailExists = await this.utilisateurRepository.emailExists(data.email_user);
        if (emailExists) {
            throw new AppError('Cet email est déjà utilisé', HTTP_STATUS.CONFLICT);
        }

        // 3. Hasher le mot de passe
        const hashedPassword = await BcryptService.hash(data.mdp_user);

        // 4. Créer l'utilisateur
        const user = await this.utilisateurRepository.create({
            ...data,
            mdp_user: hashedPassword,
        });

        // 5. Retourner les informations de base
        return {
            id_user: user.id_user,
            email_user: user.email_user,
        };
    }
}