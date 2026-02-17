import { Request, Response, NextFunction } from 'express';
import { CreatePrescription } from '../../../application/use-cases/prescription/CreatePrescription';
import { GetPrescriptionsByAdmission } from '../../../application/use-cases/prescription/GetPrescriptionsByAdmission';
import { UpdatePrescription } from '../../../application/use-cases/prescription/UpdatePrescription';
import { successResponse } from '../../../shared/utils/response.utils';
import { HTTP_STATUS } from '../../../config/constants';

export class PrescriptionController {
    constructor(
        private createPrescription: CreatePrescription,
        private getPrescriptionsByAdmission: GetPrescriptionsByAdmission,
        private updatePrescription: UpdatePrescription
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const prescription = await this.createPrescription.execute(req.body);
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
}