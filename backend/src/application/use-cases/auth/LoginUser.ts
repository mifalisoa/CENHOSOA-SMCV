// ================================================================
// FICHIER : backend/src/application/use-cases/auth/LoginUser.ts
// ================================================================
import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { BcryptService } from '../../../infrastructure/security/bcrypt.service';
import { JwtService } from '../../../infrastructure/security/jwt.service';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';

interface LoginInput {
    email: string;
    password: string;
}

interface LoginOutput {
    token: string;
    user: {
        id_user: number;
        email: string;
        nom: string;
        prenom: string;
        role: string;
        specialite?: string;
        telephone?: string;
    };
}

export class LoginUser {
    constructor(
        private utilisateurRepository: IUtilisateurRepository
    ) {}

    async execute(input: LoginInput): Promise<LoginOutput> {
        const user = await this.utilisateurRepository.findByEmail(input.email);

        if (!user) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        if (user.statut !== 'actif') {
            throw new UnauthorizedError('Compte désactivé ou suspendu');
        }

        const isPasswordValid = await BcryptService.compare(
            input.password,
            user.mot_de_passe
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        await this.utilisateurRepository.updateLastLogin(user.id_user);

       const token = JwtService.generateAccessToken({
    id_user: user.id_user,
    email:   user.email,
    role:    user.role,
    nom:     user.nom,
    prenom:  user.prenom,
});

        return {
            token,
            user: {
                id_user:    user.id_user,
                email:      user.email,
                nom:        user.nom,
                prenom:     user.prenom,
                role:       user.role,
                specialite: user.specialite || undefined,
                telephone:  user.telephone  || undefined,
            },
        };
    }
}