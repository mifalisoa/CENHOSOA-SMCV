import { Request, Response } from 'express';
import { CreateBilanBiologique } from '../../../application/use-cases/bilan-biologique/CreateBilanBiologique';
import { GetBilansByPatient } from '../../../application/use-cases/bilan-biologique/GetBilansByPatient';
import { GetBilansByAdmission } from '../../../application/use-cases/bilan-biologique/GetBilansByAdmission';
import { IBilanBiologiqueRepository } from '../../../domain/repositories/IBilanBiologiqueRepository';
import { createBilanBiologiqueSchema, updateBilanBiologiqueSchema } from '../validators/bilan-biologique.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';
import { notificationService } from '../../../application/services/NotificationService';
import { notifyMedecinTraitant, getDossierLien, getDossierLienMedecin } from '../../../shared/utils/notificationHelpers';
import { AuthRequest } from '../middlewares/auth.middleware';

export class BilanBiologiqueController {
  constructor(private bilanRepository: IBilanBiologiqueRepository) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = createBilanBiologiqueSchema.parse(req.body);
      const createBilan = new CreateBilanBiologique(this.bilanRepository);
      const bilan = await createBilan.execute({
        ...validatedData,
        date_prelevement: new Date(validatedData.date_prelevement),
      });

      const auteur      = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;
      const role        = req.user?.role ?? '';
      const lienAuteur  = getDossierLien(role, validatedData.id_patient);
      const lienMedecin = getDossierLienMedecin(validatedData.id_patient);

      notificationService.notifyAdmins({
        titre:   'Nouveau bilan biologique',
        message: `Bilan créé par ${auteur} pour le patient #${validatedData.id_patient}`,
        type: 'info', priorite: 'normale', lien: lienAuteur,
      }).catch(console.error);

      notifyMedecinTraitant(validatedData.id_patient, role, {
        titre:   'Nouveau bilan biologique sur votre patient',
        message: `${auteur} a créé un bilan biologique pour le patient #${validatedData.id_patient}`,
        type: 'info', priorite: 'normale', lien: lienMedecin,
      }).catch(console.error);

      res.status(201).json({ success: true, message: 'Bilan biologique créé avec succès', data: bilan });
    } catch (error) {
      if (error instanceof ZodError)  { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof AppError)  { res.status(error.statusCode).json({ success: false, message: error.message }); return; }
      console.error('Erreur création bilan:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (isNaN(patientId)) { res.status(400).json({ success: false, message: 'ID patient invalide' }); return; }
      const getBilans = new GetBilansByPatient(this.bilanRepository);
      const bilans = await getBilans.execute(patientId);
      res.status(200).json({ success: true, data: bilans, count: bilans.length });
    } catch (error) {
      console.error('Erreur récupération bilans:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByAdmissionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const admissionId = parseInt(req.params.admissionId as string, 10);
      if (isNaN(admissionId)) { res.status(400).json({ success: false, message: 'ID admission invalide' }); return; }
      const getBilans = new GetBilansByAdmission(this.bilanRepository);
      const bilans = await getBilans.execute(admissionId);
      res.status(200).json({ success: true, data: bilans, count: bilans.length });
    } catch (error) {
      console.error('Erreur récupération bilans:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID bilan invalide' }); return; }
      const bilan = await this.bilanRepository.findById(id);
      if (!bilan) throw new NotFoundError('Bilan biologique non trouvé');
      res.status(200).json({ success: true, data: bilan });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur récupération bilan:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID bilan invalide' }); return; }
      const existingBilan = await this.bilanRepository.findById(id);
      if (!existingBilan) throw new NotFoundError('Bilan biologique non trouvé');
      const validatedData = updateBilanBiologiqueSchema.parse(req.body);
      const updateData: any = { ...validatedData };
      if (validatedData.date_prelevement) updateData.date_prelevement = new Date(validatedData.date_prelevement);
      const bilan = await this.bilanRepository.update(id, updateData);
      res.status(200).json({ success: true, message: 'Bilan biologique mis à jour avec succès', data: bilan });
    } catch (error) {
      if (error instanceof ZodError)      { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur mise à jour bilan:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID bilan invalide' }); return; }
      const existingBilan = await this.bilanRepository.findById(id);
      if (!existingBilan) throw new NotFoundError('Bilan biologique non trouvé');
      await this.bilanRepository.delete(id);
      res.status(200).json({ success: true, message: 'Bilan biologique supprimé avec succès' });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur suppression bilan:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
}