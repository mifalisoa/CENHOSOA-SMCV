import { Request, Response, NextFunction } from 'express';
import { GetAvailableLits } from '../../../application/use-cases/lit/GetAvailableLits';
import { GetAllLits } from '../../../application/use-cases/lit/GetAllLits';
import { successResponse } from '../../../shared/utils/response.utils';
import { HTTP_STATUS } from '../../../config/constants';

export class LitController {
    constructor(
        private getAvailableLits: GetAvailableLits,
        private getAllLits: GetAllLits
    ) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lits = await this.getAllLits.execute();
            res.status(HTTP_STATUS.OK).json(successResponse(lits));
        } catch (error) {
            next(error);
        }
    };

    getAvailable = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const service = req.query.service as string | undefined;
            const lits = await this.getAvailableLits.execute(service);
            res.status(HTTP_STATUS.OK).json(successResponse(lits));
        } catch (error) {
            next(error);
        }
    };
}