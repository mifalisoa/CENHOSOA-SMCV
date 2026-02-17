import { Request, Response, NextFunction } from 'express';
import { CreateRendezVous } from '../../../application/use-cases/rendez-vous/CreateRendezVous';
import { GetRendezVousByDocteur } from '../../../application/use-cases/rendez-vous/GetRendezVousByDocteur';
import { GetRendezVousByPatient } from '../../../application/use-cases/rendez-vous/GetRendezVousByPatient';
import { CancelRendezVous } from '../../../application/use-cases/rendez-vous/CancelRendezVous';
import { ConfirmRendezVous } from '../../../application/use-cases/rendez-vous/ConfirmRendezVous';
import { successResponse } from '../../../shared/utils/response.utils';
import { HTTP_STATUS } from '../../../config/constants';
import { AuthRequest } from '../middlewares/auth.middleware';

export class RendezVousController {
    constructor(
        private createRendezVous: CreateRendezVous,
        private getRendezVousByDocteur: GetRendezVousByDocteur,
        private getRendezVousByPatient: GetRendezVousByPatient,
        private cancelRendezVous: CancelRendezVous,
        private confirmRendezVous: ConfirmRendezVous
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rendezVous = await this.createRendezVous.execute(req.body);
            res.status(HTTP_STATUS.CREATED).json(
                successResponse(rendezVous, 'Rendez-vous créé avec succès')
            );
        } catch (error) {
            next(error);
        }
    };

    getByDocteur = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const idDocteur = parseInt(Array.isArray(req.params.idDocteur) ? req.params.idDocteur[0] : req.params.idDocteur);
            const params = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
            };
            const result = await this.getRendezVousByDocteur.execute(idDocteur, params);
            res.status(HTTP_STATUS.OK).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    };

    getByPatient = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const idPatient = parseInt(Array.isArray(req.params.idPatient) ? req.params.idPatient[0] : req.params.idPatient);
            const params = {
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
            };
            const result = await this.getRendezVousByPatient.execute(idPatient, params);
            res.status(HTTP_STATUS.OK).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    };

    cancel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await this.cancelRendezVous.execute(id, req.body.raison_annulation);
            res.status(HTTP_STATUS.OK).json(
                successResponse(null, 'Rendez-vous annulé avec succès')
            );
        } catch (error) {
            next(error);
        }
    };

    confirm = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            await this.confirmRendezVous.execute(id);
            res.status(HTTP_STATUS.OK).json(
                successResponse(null, 'Rendez-vous confirmé avec succès')
            );
        } catch (error) {
            next(error);
        }
    };
}