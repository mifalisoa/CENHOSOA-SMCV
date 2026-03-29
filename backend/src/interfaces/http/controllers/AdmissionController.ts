// backend/src/interfaces/http/controllers/AdmissionController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateAdmission }          from '../../../application/use-cases/admission/CreateAdmission';
import { GetAdmissionById }         from '../../../application/use-cases/admission/GetAdmissionById';
import { ListAdmissions }           from '../../../application/use-cases/admission/ListAdmissions';
import { GetAdmissionsEnCours }     from '../../../application/use-cases/admission/GetAdmissionsEnCours';
import { AssignLit }                from '../../../application/use-cases/admission/AssignLit';
import { CloturerAdmission }        from '../../../application/use-cases/admission/CloturerAdmission';
import { successResponse }          from '../../../shared/utils/response.utils';
import { HTTP_STATUS }              from '../../../config/constants';
import { notificationService }      from '../../../application/services/NotificationService';
import { AuthRequest }              from '../middlewares/auth.middleware';

export class AdmissionController {
  constructor(
    private createAdmissionUseCase:      CreateAdmission,
    private getAdmissionByIdUseCase:     GetAdmissionById,
    private listAdmissionsUseCase:       ListAdmissions,
    private getAdmissionsEnCoursUseCase: GetAdmissionsEnCours,
    private assignLitUseCase:            AssignLit,
    private cloturerAdmissionUseCase:    CloturerAdmission,
  ) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const admission = await this.createAdmissionUseCase.execute(req.body);
      const auteur    = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;

      // ✅ Notifier admins ET secrétaires
      notificationService.notifyAdminsAndSecretaires({
        titre:    'Nouvelle admission',
        message:  `Nouvelle admission enregistrée par ${auteur} pour le patient #${admission.id_patient}`,
        type:     'admission',
        priorite: 'normale',
        lien:     '/patients-hospitalises',
      }).catch(console.error);

      res.status(HTTP_STATUS.CREATED).json(
        successResponse(admission, 'Admission créée avec succès')
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id        = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const admission = await this.getAdmissionByIdUseCase.execute(id);
      res.status(HTTP_STATUS.OK).json(successResponse(admission));
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = {
        page:  req.query.page  ? parseInt(req.query.page  as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };
      const result = await this.listAdmissionsUseCase.execute(params);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  getEnCours = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admissions = await this.getAdmissionsEnCoursUseCase.execute();
      res.status(HTTP_STATUS.OK).json(successResponse(admissions));
    } catch (error) {
      next(error);
    }
  };

  assignLit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id     = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const auteur = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;

      await this.assignLitUseCase.execute(id, req.body.id_lit);

      // ✅ Notifier admins ET secrétaires
      notificationService.notifyAdminsAndSecretaires({
        titre:    'Lit assigné',
        message:  `Un lit a été assigné à l'admission #${id} par ${auteur}`,
        type:     'admission',
        priorite: 'normale',
        lien:     '/patients-hospitalises',
      }).catch(console.error);

      res.status(HTTP_STATUS.OK).json(
        successResponse(null, 'Lit assigné avec succès')
      );
    } catch (error) {
      next(error);
    }
  };

  cloturer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id     = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const auteur = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;

      await this.cloturerAdmissionUseCase.execute(id);

      // ✅ Notifier admins ET secrétaires
      notificationService.notifyAdminsAndSecretaires({
        titre:    'Admission clôturée',
        message:  `L'admission #${id} a été clôturée par ${auteur}`,
        type:     'admission',
        priorite: 'normale',
        lien:     '/patients-hospitalises',
      }).catch(console.error);

      res.status(HTTP_STATUS.OK).json(
        successResponse(null, 'Admission clôturée avec succès')
      );
    } catch (error) {
      next(error);
    }
  };
}