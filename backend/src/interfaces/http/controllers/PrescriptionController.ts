import { Request, Response, NextFunction } from 'express';
import { CreatePrescription } from '../../../application/use-cases/prescription/CreatePrescription';
import { GetPrescriptionsByAdmission } from '../../../application/use-cases/prescription/GetPrescriptionsByAdmission';
import { UpdatePrescription } from '../../../application/use-cases/prescription/UpdatePrescription';
import { ValiderPrescription } from '../../../application/use-cases/prescription/ValiderPrescription';
import { IPrescriptionRepository } from '../../../domain/repositories/IPrescriptionRepository';
import { successResponse } from '../../../shared/utils/response.utils';
import { HTTP_STATUS } from '../../../config/constants';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RoleType } from '../../../shared/types';

export class PrescriptionController {
    constructor(
        private createPrescription: CreatePrescription,
        private getPrescriptionsByAdmission: GetPrescriptionsByAdmission,
        private updatePrescription: UpdatePrescription,
        private prescriptionRepository: IPrescriptionRepository
    ) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const prescription = await this.createPrescription.execute({
                ...req.body,
                // Qui a saisi la prescription, jamais confie au body
                cree_par_id: req.user?.id_user,
                role_createur: req.user?.role as RoleType,
            });
            res.status(HTTP_STATUS.CREATED).json(
                successResponse(prescription, 'Prescription créée avec succès')
            );
        } catch (error) {
            next(error);
        }
    };

    getByAdmission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const idAdmission = parseInt(Array.isArray(req.params.idAdmission) ? req.params.idAdmission[0] : req.params.idAdmission);
            const type = req.query.type as string | undefined;
            const prescriptions = await this.getPrescriptionsByAdmission.execute(idAdmission, type);
            res.status(HTTP_STATUS.OK).json(successResponse(prescriptions));
        } catch (error) {
            next(error);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            const prescription = await this.updatePrescription.execute(id, req.body);
            res.status(HTTP_STATUS.OK).json(
                successResponse(prescription, 'Prescription mise à jour avec succès')
            );
        } catch (error) {
            next(error);
        }
    };

    valider = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: 'ID prescription invalide' });
                return;
            }
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Non authentifié' });
                return;
            }

            const { statut } = req.body;
            if (!statut || !['valide', 'refuse'].includes(statut)) {
                res.status(400).json({ success: false, message: 'Statut invalide — valeurs acceptées : valide, refuse' });
                return;
            }

            const validerPrescription = new ValiderPrescription(this.prescriptionRepository);
            const prescription = await validerPrescription.execute({
                id,
                statut,
                validateur_id: req.user.id_user,
                validateur_role: req.user.role as RoleType,
                mode_garde: false,
            });

            res.status(HTTP_STATUS.OK).json(
                successResponse(prescription, `Prescription ${statut === 'valide' ? 'validée' : 'refusée'} avec succès`)
            );
        } catch (error) {
            if (error instanceof Error) {
                res.status(403).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    };
}