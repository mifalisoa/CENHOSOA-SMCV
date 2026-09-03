import { Request, Response } from 'express';
import { CreateCompteRenduConsultation } from '../../../application/use-cases/compte-rendu-consultation/CreateCompteRenduConsultation';
import { GetComptesRendusConsultationByPatient } from '../../../application/use-cases/compte-rendu-consultation/GetComptesRendusConsultationByPatient';
import { ICompteRenduConsultationRepository } from '../../../domain/repositories/ICompteRenduConsultationRepository';
import { createCompteRenduConsultationSchema, updateCompteRenduConsultationSchema } from '../validators/compte-rendu-consultation.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError } from '../../../shared/errors/AppError';
import { notificationService } from '../../../application/services/NotificationService';
import { notifyMedecinTraitant, getDossierLien, getDossierLienMedecin } from '../../../shared/utils/notificationHelpers';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CompteRenduConsultationPDFService } from '../../../application/services/CompteRenduConsultationPDFService';
import { pool } from '../../../config/database';

export class CompteRenduConsultationController {
  constructor(private repository: ICompteRenduConsultationRepository) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = createCompteRenduConsultationSchema.parse(req.body);
      const createCompteRenduConsultation = new CreateCompteRenduConsultation(this.repository);

      const medecin = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`.trim();

      const compteRendu = await createCompteRenduConsultation.execute({
        ...validatedData,
        medecin,
        cree_par_id: req.user?.id_user,
        date_consultation: new Date(validatedData.date_consultation),
      } as any);

      const auteur      = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;
      const role        = req.user?.role ?? '';
      const lienAuteur  = getDossierLien(role, validatedData.id_patient);
      const lienMedecin = getDossierLienMedecin(validatedData.id_patient);

      notificationService.notifyAdmins({
        titre:   'Nouveau compte rendu de consultation',
        message: `Compte rendu de consultation redige par ${auteur} pour le patient #${validatedData.id_patient}`,
        type: 'info', priorite: 'normale', lien: lienAuteur,
      }).catch(console.error);

      notifyMedecinTraitant(validatedData.id_patient, role, {
        titre:   'Nouveau compte rendu de consultation sur votre patient',
        message: `${auteur} a redige un compte rendu de consultation pour le patient #${validatedData.id_patient}`,
        type: 'info', priorite: 'normale', lien: lienMedecin,
      }).catch(console.error);

      res.status(201).json({ success: true, message: 'Compte rendu de consultation créé avec succès', data: compteRendu });
    } catch (error) {
      if (error instanceof ZodError) { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof AppError) { res.status(error.statusCode).json({ success: false, message: error.message }); return; }
      console.error('Erreur création compte rendu de consultation:', error);
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erreur serveur' });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientId = parseInt(req.params.patientId as string, 10);
      if (isNaN(patientId)) { res.status(400).json({ success: false, message: 'ID patient invalide' }); return; }
      const getComptesRendus = new GetComptesRendusConsultationByPatient(this.repository);
      const comptesRendus = await getComptesRendus.execute(patientId);
      res.status(200).json({ success: true, data: comptesRendus, count: comptesRendus.length });
    } catch (error) {
      console.error('Erreur récupération comptes rendus de consultation:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID compte rendu invalide' }); return; }
      const compteRendu = await this.repository.findById(id);
      if (!compteRendu) throw new NotFoundError('Compte rendu de consultation non trouvé');
      res.status(200).json({ success: true, data: compteRendu });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur récupération compte rendu de consultation:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID compte rendu invalide' }); return; }
      const existing = await this.repository.findById(id);
      if (!existing) throw new NotFoundError('Compte rendu de consultation non trouvé');
      const validatedData = updateCompteRenduConsultationSchema.parse(req.body);
      const updateData: any = {
        ...validatedData,
        modifie_par_id: req.user?.id_user,
      };
      if (validatedData.date_consultation) updateData.date_consultation = new Date(validatedData.date_consultation);
      const compteRendu = await this.repository.update(id, updateData);
      res.status(200).json({ success: true, message: 'Compte rendu de consultation mis à jour avec succès', data: compteRendu });
    } catch (error) {
      if (error instanceof ZodError)      { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur mise à jour compte rendu de consultation:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID compte rendu invalide' }); return; }
      const existing = await this.repository.findById(id);
      if (!existing) throw new NotFoundError('Compte rendu de consultation non trouvé');
      await this.repository.delete(id);
      res.status(200).json({ success: true, message: 'Compte rendu de consultation supprimé avec succès' });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur suppression compte rendu de consultation:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  // ── PDF ───────────────────────────────────────────────────────────────────────

  getPDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID compte rendu invalide' }); return; }

      const compteRendu = await this.repository.findById(id);
      if (!compteRendu) { res.status(404).json({ success: false, message: 'Compte rendu de consultation non trouvé' }); return; }

      const patientResult = await pool.query(
        'SELECT * FROM patients WHERE id_patient = $1',
        [compteRendu.id_patient]
      );
      if (patientResult.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Patient non trouvé' });
        return;
      }
      const patient = patientResult.rows[0];

      const pdfService = new CompteRenduConsultationPDFService();
      const doc = pdfService.generatePDF(compteRendu, patient);

      const filename = `compte_rendu_consultation_${id}_${patient.nom_patient}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      doc.pipe(res);
      doc.end();
    } catch (error) {
      console.error('Erreur génération PDF compte rendu de consultation:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la génération du PDF' });
    }
  };
}