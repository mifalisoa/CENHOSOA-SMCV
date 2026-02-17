import { Request, Response, NextFunction } from 'express';
import { LoginUser } from '../../../application/use-cases/auth/LoginUser';
import { RegisterUser } from '../../../application/use-cases/auth/RegisterUser';
import { successResponse } from '../../../shared/utils/response.utils';
import { HTTP_STATUS } from '../../../config/constants';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
    constructor(
        private loginUser: LoginUser,
        private registerUser: RegisterUser
    ) {}

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // ✅ CORRECTION: Supporter email/email_user ET password/mot_de_passe
            const loginData = {
                email_user: req.body.email_user || req.body.email,
                password: req.body.password || req.body.mot_de_passe // ✅ Accepter les deux formats
            };

            console.log('📨 Tentative de connexion:', loginData.email_user);
            console.log('🔑 Password présent:', !!loginData.password);

            const result = await this.loginUser.execute(loginData);
            
            console.log('✅ Connexion réussie:', result.user.email_user);

            res.status(HTTP_STATUS.OK).json(
                successResponse(result, 'Connexion réussie')
            );
        } catch (error) {
            console.error('❌ Erreur login:', error);
            next(error);
        }
    };

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // ✅ CORRECTION: Supporter password/mot_de_passe pour l'inscription aussi
            const registerData = {
                ...req.body,
                password: req.body.password || req.body.mot_de_passe
            };

            const result = await this.registerUser.execute(registerData);
            
            res.status(HTTP_STATUS.CREATED).json(
                successResponse(result, 'Utilisateur créé avec succès')
            );
        } catch (error) {
            console.error('❌ Erreur register:', error);
            next(error);
        }
    };

    me = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            res.status(HTTP_STATUS.OK).json(
                successResponse({ user: req.user }, 'Utilisateur connecté')
            );
        } catch (error) {
            next(error);
        }
    };
}
