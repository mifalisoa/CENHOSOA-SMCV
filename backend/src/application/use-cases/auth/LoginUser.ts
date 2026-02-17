import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { BcryptService } from '../../../infrastructure/security/bcrypt.service';
import { JwtService } from '../../../infrastructure/security/jwt.service';
import { UnauthorizedError } from '../../../shared/errors/UnauthorizedError';

interface LoginInput {
    email_user: string;
    password: string;
}

interface LoginOutput {
    token: string;
    user: {
        id_user: number;
        email_user: string;
        nom_user: string;
        prenom_user: string;
        role_user: string;
        specialite_user?: string;
        tel_user?: string;
    };
}

export class LoginUser {
    constructor(
        private utilisateurRepository: IUtilisateurRepository
    ) {}

    async execute(input: LoginInput): Promise<LoginOutput> {
        console.log('🔐 LoginUser - Recherche utilisateur:', input.email_user);

        // Trouver l'utilisateur par email
        const user = await this.utilisateurRepository.findByEmail(input.email_user);

        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        console.log('✅ Utilisateur trouvé:', user.email_user);

        // ✅ Vérifier que l'utilisateur est actif (actif_user au lieu de is_active)
        if (!user.actif_user) {
            console.log('❌ Compte désactivé');
            throw new UnauthorizedError('Compte désactivé');
        }

        // ✅ Comparer avec mdp_user au lieu de password_hash
        const isPasswordValid = await BcryptService.compare(
            input.password,
            user.mdp_user
        );

        if (!isPasswordValid) {
            console.log('❌ Mot de passe incorrect');
            throw new UnauthorizedError('Email ou mot de passe incorrect');
        }

        console.log('✅ Mot de passe valide');

        // Générer le token JWT
        const token = JwtService.generateAccessToken({
            id_user: user.id_user,
            email_user: user.email_user,
            role_user: user.role_user
        });

        console.log('✅ Token JWT généré');

        // Retourner le résultat (sans le mot de passe)
        return {
            token,
            user: {
                id_user: user.id_user,
                email_user: user.email_user,
                nom_user: user.nom_user,
                prenom_user: user.prenom_user,
                role_user: user.role_user,
                specialite_user: user.specialite_user || undefined,
                tel_user: user.tel_user || undefined
            }
        };
    }
}