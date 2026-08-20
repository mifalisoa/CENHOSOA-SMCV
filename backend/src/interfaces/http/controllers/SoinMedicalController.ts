import { Request, Response } from 'express';
import { CreateSoinMedical } from '../../../application/use-cases/soin-medical/CreateSoinMedical';
import { GetSoinsMedicauxByPatient } from '../../../application/use-cases/soin-medical/GetSoinsMedicauxByPatient';
import { GetSoinsMedicauxByAdmission } from '../../../application/use-cases/soin-medical/GetSoinsMedicauxByAdmission';
import { VerifySoinMedical } from '../../../application/use-cases/soin-medical/VerifySoinMedical';
import { ValiderSoinMedical } from '../../../application/use-cases/soin-medical/ValiderSoinMedical';
import { ISoinMedicalRepository } from '../../../domain/repositories/ISoinMedicalRepository';
import { createSoinMedicalSchema, updateSoinMedicalSchema } from '../validators/soin-medical.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';
import { notificationService } from '../../../application/services/NotificationService';
import { notifyMedecinTraitant, getDossierLien, getDossierLienMedecin } from '../../../shared/utils/notificationHelpers';
import { AuthRequest } from '../middlewares/auth.middleware';
import { RoleType } from '../../../shared/types';

export class SoinMedicalController {
  constructor(private soinRepository: ISoinMedicalRepository) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = createSoinMedicalSchema.parse(req.body);
      const createSoin = new CreateSoinMedical(this.soinRepository);

      const realisePar = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`.trim() || 'Utilisateur inconnu'; 

      const soin = await createSoin.execute({
        ...validatedData,
        date_soin:     new Date(validatedData.date_soin),
        realise_par:   realisePar,
        cree_par_id:   req.user?.id_user,
        role_createur: req.user?.role as RoleType,
      });

      const auteur      = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;
      const role        = req.user?.role ?? '';
      const lienAuteur  = getDossierLien(role, validatedData.id_patient);
      const lienMedecin = getDossierLienMedecin(validatedData.id_patient);

      notificationService.notifyAdmins({
        titre:   'Nouveau soin médical',
        message: `Soin médical enregistré par ${auteur} pour le patient #${validatedData.id_patient}`,
        type: 'info', priorite: 'normale', lien: lienAuteur,
      }).catch(console.error);

      notifyMedecinTraitant(validatedData.id_patient, role, {
        titre:   'Nouveau soin médical sur votre patient',
        message: `${auteur} a enregistré un soin médical pour le patient #${validatedData.id_patient}`,
        type: 'info', priorite: 'normale', lien: lienMedecin,
      }).catch(console.error);

      res.status(201).json({ success: true, message: 'Soin médical créé avec succès', data: soin });
    } catch (error) {
      if (error instanceof ZodError) { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof AppError) { res.status(error.statusCode).json({ success: false, message: error.message }); return; }
      console.error('Erreur création soin médical:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (isNaN(patientId)) { res.status(400).json({ success: false, message: 'ID patient invalide' }); return; }
      const getSoins = new GetSoinsMedicauxByPatient(this.soinRepository);
      const soins = await getSoins.execute(patientId);
      res.status(200).json({ success: true, data: soins, count: soins.length });
    } catch (error) {
      console.error('Erreur récupération soins médicaux:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByAdmissionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const admissionId = parseInt(req.params.admissionId as string, 10);
      if (isNaN(admissionId)) { res.status(400).json({ success: false, message: 'ID admission invalide' }); return; }
      const getSoins = new GetSoinsMedicauxByAdmission(this.soinRepository);
      const soins = await getSoins.execute(admissionId);
      res.status(200).json({ success: true, data: soins, count: soins.length });
    } catch (error) {
      console.error('Erreur récupération soins médicaux:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID soin invalide' }); return; }
      const soin = await this.soinRepository.findById(id);
      if (!soin) throw new NotFoundError('Soin médical non trouvé');
      res.status(200).json({ success: true, data: soin });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur récupération soin médical:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID soin invalide' }); return; }
    const existingSoin = await this.soinRepository.findById(id);
    if (!existingSoin) throw new NotFoundError('Soin médical non trouvé');
    const validatedData = updateSoinMedicalSchema.parse(req.body);
    const updateData: any = { ...validatedData };
    if (validatedData.date_soin) updateData.date_soin = new Date(validatedData.date_soin);
    updateData.modifie_par_id = req.user?.id_user;
    const soin = await this.soinRepository.update(id, updateData);
    res.status(200).json({ success: true, message: 'Soin médical mis à jour avec succès', data: soin });
  } catch (error) {
    if (error instanceof ZodError)      { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
    if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
    console.error('Erreur mise à jour soin médical:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

  verify = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID soin invalide' }); return; }
      const verifySoin = new VerifySoinMedical(this.soinRepository);
      const soin = await verifySoin.execute(id);
      res.status(200).json({ success: true, message: `Soin médical ${soin.verifie ? 'vérifié' : 'non vérifié'}`, data: soin });
    } catch (error) {
      console.error('Erreur vérification soin médical:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  valider = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID soin invalide' }); return; }

      if (!req.user) { res.status(401).json({ success: false, message: 'Non authentifié' }); return; }

      const { statut } = req.body;
      if (!statut || !['valide', 'rejete'].includes(statut)) {
        res.status(400).json({ success: false, message: 'Statut invalide — valeurs acceptées : valide, rejete' });
        return;
      }

      const validerSoin = new ValiderSoinMedical(this.soinRepository);
      const soin = await validerSoin.execute({
        id,
        statut,
        validateur_id:   req.user.id_user,
        validateur_role: req.user.role as RoleType,
        mode_garde:      false,
      });

      res.status(200).json({
        success: true,
        message: `Soin médical ${statut === 'valide' ? 'validé' : 'rejeté'} avec succès`,
        data: soin,
      });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      if (error instanceof AppError)      { res.status(error.statusCode).json({ success: false, message: error.message }); return; }
      if (error instanceof Error)         { res.status(403).json({ success: false, message: error.message }); return; }
      console.error('Erreur validation soin médical:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID soin invalide' }); return; }
      const existingSoin = await this.soinRepository.findById(id);
      if (!existingSoin) throw new NotFoundError('Soin médical non trouvé');
      await this.soinRepository.delete(id);
      res.status(200).json({ success: true, message: 'Soin médical supprimé avec succès' });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur suppression soin médical:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
} 