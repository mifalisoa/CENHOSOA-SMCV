import { Request, Response } from 'express';
import { CreateTraitement }          from '../../../application/use-cases/traitement/CreateTraitement';
import { CreateManyTraitements, CreateOrdonnanceDTOWithRole } from '../../../application/use-cases/traitement/CreateManyTraitements';
import { GetTraitementsByPatient }   from '../../../application/use-cases/traitement/GetTraitementsByPatient';
import { GetTraitementsByAdmission } from '../../../application/use-cases/traitement/GetTraitementsByAdmission';
import { ValiderTraitement }         from '../../../application/use-cases/traitement/ValiderTraitement';
import { ITraitementRepository }     from '../../../domain/repositories/ITraitementRepository';
import { createTraitementSchema, createManyTraitementsSchema, updateTraitementSchema } from '../validators/traitement.validator';
import { ZodError }      from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError }      from '../../../shared/errors/AppError';
import { notificationService }   from '../../../application/services/NotificationService';
import { notifyMedecinTraitant } from '../../../shared/utils/notificationHelpers';
import { AuthRequest }           from '../middlewares/auth.middleware';
import { RoleType }              from '../../../shared/types';

const MEDICAL_ROLES = ['medecin', 'interne', 'stagiaire', 'infirmier'];

function getDossierLien(role: string, patientId: number): string {
  return MEDICAL_ROLES.includes(role)
    ? `/doctor/patients/${patientId}/dossier`
    : `/patients/${patientId}/dossier`;
}

function getParam(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val;
}

export class TraitementController {
  constructor(private traitementRepository: ITraitementRepository) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const auteur      = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;
      const role        = req.user?.role ?? '';
      const idPatient   = req.body.id_patient as number;
      const lienAuteur  = getDossierLien(role, idPatient);
      const lienMedecin = `/doctor/patients/${idPatient}/dossier`;

      if (Array.isArray(req.body.medicaments)) {
        const validatedData = createManyTraitementsSchema.parse(req.body);
        const createMany    = new CreateManyTraitements(this.traitementRepository);

        const payload: CreateOrdonnanceDTOWithRole = {
          ...validatedData,
          date_prescription: String(validatedData.date_prescription),
          cree_par_id:       req.user?.id_user,
          role_createur:     req.user?.role as RoleType,
        };

        const traitements = await createMany.execute(payload);

        notificationService.notifyAdmins({
          titre: 'Nouvelle ordonnance créée',
          message: `${auteur} a prescrit ${traitements.length} médicament(s) pour le patient #${idPatient}`,
          type: 'info', priorite: 'normale', lien: lienAuteur,
        }).catch(console.error);

        notifyMedecinTraitant(idPatient, role, {
          titre: 'Nouvelle ordonnance sur votre patient',
          message: `${auteur} a prescrit ${traitements.length} médicament(s) pour le patient #${idPatient}`,
          type: 'info', priorite: 'normale', lien: lienMedecin,
        }).catch(console.error);

        res.status(201).json({ success: true, message: `${traitements.length} traitement(s) créé(s) avec succès`, data: traitements, count: traitements.length });
        return;
      }

      const validatedData    = createTraitementSchema.parse(req.body);
      const createTraitement = new CreateTraitement(this.traitementRepository);
      const traitement       = await createTraitement.execute({
        ...validatedData,
        date_prescription: new Date(validatedData.date_prescription as string),
        cree_par_id:       req.user?.id_user,
        role_createur:     req.user?.role as RoleType,
      });

      notificationService.notifyAdmins({
        titre: 'Nouveau traitement prescrit',
        message: `Traitement prescrit par ${auteur} pour le patient #${idPatient}`,
        type: 'info', priorite: 'normale', lien: lienAuteur,
      }).catch(console.error);

      notifyMedecinTraitant(idPatient, role, {
        titre: 'Nouveau traitement sur votre patient',
        message: `${auteur} a prescrit un traitement pour le patient #${idPatient}`,
        type: 'info', priorite: 'normale', lien: lienMedecin,
      }).catch(console.error);

      res.status(201).json({ success: true, message: 'Traitement créé avec succès', data: traitement });

    } catch (error) {
      if (error instanceof ZodError) { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof AppError) { res.status(error.statusCode).json({ success: false, message: error.message }); return; }
      console.error('Erreur création traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientId = parseInt(getParam(req, 'patientId'), 10);
      if (isNaN(patientId)) { res.status(400).json({ success: false, message: 'ID patient invalide' }); return; }
      const getTraitements = new GetTraitementsByPatient(this.traitementRepository);
      const traitements    = await getTraitements.execute(patientId);
      res.status(200).json({ success: true, data: traitements, count: traitements.length });
    } catch (error) {
      console.error('Erreur récupération traitements:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByAdmissionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const admissionId = parseInt(getParam(req, 'admissionId'), 10);
      if (isNaN(admissionId)) { res.status(400).json({ success: false, message: 'ID admission invalide' }); return; }
      const getTraitements = new GetTraitementsByAdmission(this.traitementRepository);
      const traitements    = await getTraitements.execute(admissionId);
      res.status(200).json({ success: true, data: traitements, count: traitements.length });
    } catch (error) {
      console.error('Erreur récupération traitements:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(getParam(req, 'id'), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID traitement invalide' }); return; }
      const traitement = await this.traitementRepository.findById(id);
      if (!traitement) throw new NotFoundError('Traitement non trouvé');
      res.status(200).json({ success: true, data: traitement });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur récupération traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(getParam(req, 'id'), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID traitement invalide' }); return; }
      const existing = await this.traitementRepository.findById(id);
      if (!existing) throw new NotFoundError('Traitement non trouvé');
      const validatedData = updateTraitementSchema.parse(req.body);
      const updateData: any = { ...validatedData };
      if (validatedData.date_prescription) updateData.date_prescription = new Date(validatedData.date_prescription as string);
      const traitement = await this.traitementRepository.update(id, updateData);
      res.status(200).json({ success: true, message: 'Traitement mis à jour avec succès', data: traitement });
    } catch (error) {
      if (error instanceof ZodError)      { res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues }); return; }
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur mise à jour traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  valider = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(getParam(req, 'id'), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID traitement invalide' }); return; }

      if (!req.user) { res.status(401).json({ success: false, message: 'Non authentifié' }); return; }

      const { statut } = req.body;
      if (!statut || !['valide', 'rejete'].includes(statut)) {
        res.status(400).json({ success: false, message: 'Statut invalide — valeurs acceptées : valide, rejete' });
        return;
      }

      const validerTraitement = new ValiderTraitement(this.traitementRepository);
      const traitement = await validerTraitement.execute({
        id,
        statut,
        validateur_id:   req.user.id_user,
        validateur_role: req.user.role as RoleType,
        mode_garde:      false,
      });

      res.status(200).json({
        success: true,
        message: `Traitement ${statut === 'valide' ? 'validé' : 'rejeté'} avec succès`,
        data: traitement,
      });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      if (error instanceof AppError)      { res.status(error.statusCode).json({ success: false, message: error.message }); return; }
      if (error instanceof Error)         { res.status(403).json({ success: false, message: error.message }); return; }
      console.error('Erreur validation traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(getParam(req, 'id'), 10);
      if (isNaN(id)) { res.status(400).json({ success: false, message: 'ID traitement invalide' }); return; }
      const existing = await this.traitementRepository.findById(id);
      if (!existing) throw new NotFoundError('Traitement non trouvé');
      await this.traitementRepository.delete(id);
      res.status(200).json({ success: true, message: 'Traitement supprimé avec succès' });
    } catch (error) {
      if (error instanceof NotFoundError) { res.status(404).json({ success: false, message: error.message }); return; }
      console.error('Erreur suppression traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
} 