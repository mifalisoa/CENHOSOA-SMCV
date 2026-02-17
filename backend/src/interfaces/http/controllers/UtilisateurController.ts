import { Request, Response, NextFunction } from 'express';
import { GetUtilisateurById } from '../../../application/use-cases/utilisateur/GetUtilisateurById';
import { ListUtilisateurs } from '../../../application/use-cases/utilisateur/ListUtilisateurs';
import { GetUtilisateursByRole } from '../../../application/use-cases/utilisateur/GetUtilisateursByRole';
import { UpdateUtilisateur } from '../../../application/use-cases/utilisateur/UpdateUtilisateur';
import { DeactivateUtilisateur } from '../../../application/use-cases/utilisateur/DeactivateUtilisateur';
import { ActivateUtilisateur } from '../../../application/use-cases/utilisateur/ActivateUtilisateur';
import { ChangePassword } from '../../../application/use-cases/utilisateur/ChangePassword';
import { successResponse } from '../../../shared/utils/response.utils';
import { HTTP_STATUS } from '../../../config/constants';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UtilisateurController {
    constructor(
        private getUtilisateurByIdUseCase: GetUtilisateurById,
        private listUtilisateursUseCase: ListUtilisateurs,
        private getUtilisateursByRoleUseCase: GetUtilisateursByRole,
        private updateUtilisateurUseCase: UpdateUtilisateur,
        private deactivateUtilisateurUseCase: DeactivateUtilisateur,
        private activateUtilisateurUseCase: ActivateUtilisateur,
        private changePasswordUseCase: ChangePassword
    ) {}

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const user = await this.getUtilisateurByIdUseCase.execute(id);
            res.status(HTTP_STATUS.OK).json(successResponse(user));
        } catch (error) {
            next(error);
        }
    };

    list = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
            };
            const result = await this.listUtilisateursUseCase.execute(params);
            res.status(HTTP_STATUS.OK).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    };

    getByRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = Array.isArray(req.params.role) ? req.params.role[0] : req.params.role;
            const users = await this.getUtilisateursByRoleUseCase.execute(role);
            res.status(HTTP_STATUS.OK).json(successResponse(users));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const user = await this.updateUtilisateurUseCase.execute(id, req.body);
            res.status(HTTP_STATUS.OK).json(
                successResponse(user, 'Utilisateur mis à jour avec succès')
            );
        } catch (error) {
            next(error);
        }
    };

    deactivate = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await this.deactivateUtilisateurUseCase.execute(id, req.user!.id_user);
            res.status(HTTP_STATUS.OK).json(
                successResponse(null, 'Utilisateur désactivé avec succès')
            );
        } catch (error) {
            next(error);
        }
    };

    activate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await this.activateUtilisateurUseCase.execute(id);
            res.status(HTTP_STATUS.OK).json(
                successResponse(null, 'Utilisateur activé avec succès')
            );
        } catch (error) {
            next(error);
        }
    };

    changePasswordHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            await this.changePasswordUseCase.execute(
                req.user!.id_user,
                req.body.current_password,
                req.body.new_password
            );
            res.status(HTTP_STATUS.OK).json(
                successResponse(null, 'Mot de passe modifié avec succès')
            );
        } catch (error) {
            next(error);
        }
    };
}