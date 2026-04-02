import { Request, Response } from 'express';
import { CreateTraitement }          from '../../../application/use-cases/traitement/CreateTraitement';
import { CreateManyTraitements }     from '../../../application/use-cases/traitement/CreateManyTraitements';
import { GetTraitementsByPatient }   from '../../../application/use-cases/traitement/GetTraitementsByPatient';
import { GetTraitementsByAdmission } from '../../../application/use-cases/traitement/GetTraitementsByAdmission';
import { ITraitementRepository }     from '../../../domain/repositories/ITraitementRepository';
import {
  createTraitementSchema,
  createManyTraitementsSchema,
  updateTraitementSchema,
} from '../validators/traitement.validator';
import { ZodError }      from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AppError }      from '../../../shared/errors/AppError';
import { notificationService }     from '../../../application/services/NotificationService';
import { notifyMedecinTraitant }   from '../../../shared/utils/notificationHelpers';
import { AuthRequest }             from '../middlewares/auth.middleware';

const MEDICAL_ROLES = ['medecin', 'interne', 'stagiaire', 'infirmier'];

function getDossierLien(role: string, patientId: number): string {
  return MEDICAL_ROLES.includes(role)
    ? `/doctor/patients/${patientId}/dossier`
    : `/patients/${patientId}/dossier`;
}

// ── Helper : extrait un param string depuis req.params (évite string | string[]) 
function getParam(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val;
}

export class TraitementController {
  constructor(private traitementRepository: ITraitementRepository) {}

  // ── POST / ────────────────────────────────────────────────────────────────────
  // Accepte deux formats :
  //   { ...infosCommunes, medicaments: [...] }  → createMany (nouvelle logique)
  //   { ...infosCommunes, medicament: '...' }   → create    (rétrocompatibilité)
  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const auteur      = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`;
      const role        = req.user?.role ?? '';
      const idPatient   = req.body.id_patient as number;
      const lienAuteur  = getDossierLien(role, idPatient);
      const lienMedecin = `/doctor/patients/${idPatient}/dossier`;

      // ── Cas 1 : tableau de médicaments ────────────────────────────────────────
      if (Array.isArray(req.body.medicaments)) {
        const validatedData = createManyTraitementsSchema.parse(req.body);
        const createMany    = new CreateManyTraitements(this.traitementRepository);

        // ✅ Fix erreur 1 : date_prescription doit être string pour CreateOrdonnanceDTO
        const traitements = await createMany.execute({
          ...validatedData,
          date_prescription: String(validatedData.date_prescription),
        });

        notificationService.notifyAdmins({
          titre:   'Nouvelle ordonnance créée',
          message: `${auteur} a prescrit ${traitements.length} médicament(s) pour le patient #${idPatient}`,
          type: 'info', priorite: 'normale', lien: lienAuteur,
        }).catch(console.error);

        notifyMedecinTraitant(idPatient, role, {
          titre:   'Nouvelle ordonnance sur votre patient',
          message: `${auteur} a prescrit ${traitements.length} médicament(s) pour le patient #${idPatient}`,
          type: 'info', priorite: 'normale', lien: lienMedecin,
        }).catch(console.error);

        res.status(201).json({
          success: true,
          message: `${traitements.length} traitement(s) créé(s) avec succès`,
          data:    traitements,
          count:   traitements.length,
        });
        return;
      }

      // ── Cas 2 : médicament unique (rétrocompatibilité) ────────────────────────
      const validatedData    = createTraitementSchema.parse(req.body);
      const createTraitement = new CreateTraitement(this.traitementRepository);
      const traitement       = await createTraitement.execute({
        ...validatedData,
        date_prescription: new Date(validatedData.date_prescription as string),
      } as any);

      notificationService.notifyAdmins({
        titre:   'Nouveau traitement prescrit',
        message: `Traitement prescrit par ${auteur} pour le patient #${idPatient}`,
        type: 'info', priorite: 'normale', lien: lienAuteur,
      }).catch(console.error);

      notifyMedecinTraitant(idPatient, role, {
        titre:   'Nouveau traitement sur votre patient',
        message: `${auteur} a prescrit un traitement pour le patient #${idPatient}`,
        type: 'info', priorite: 'normale', lien: lienMedecin,
      }).catch(console.error);

      res.status(201).json({
        success: true,
        message: 'Traitement créé avec succès',
        data:    traitement,
      });

    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues });
        return;
      }
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.error('Erreur création traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  // ── GET /patient/:patientId ───────────────────────────────────────────────────
  getByPatientId = async (req: Request, res: Response): Promise<void> => {
    try {
      // ✅ Fix erreurs 2-6 : getParam() évite string | string[]
      const patientId = parseInt(getParam(req, 'patientId'), 10);
      if (isNaN(patientId)) {
        res.status(400).json({ success: false, message: 'ID patient invalide' });
        return;
      }
      const getTraitements = new GetTraitementsByPatient(this.traitementRepository);
      const traitements    = await getTraitements.execute(patientId);
      res.status(200).json({ success: true, data: traitements, count: traitements.length });
    } catch (error) {
      console.error('Erreur récupération traitements:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  // ── GET /admission/:admissionId ───────────────────────────────────────────────
  getByAdmissionId = async (req: Request, res: Response): Promise<void> => {
    try {
      const admissionId = parseInt(getParam(req, 'admissionId'), 10);
      if (isNaN(admissionId)) {
        res.status(400).json({ success: false, message: 'ID admission invalide' });
        return;
      }
      const getTraitements = new GetTraitementsByAdmission(this.traitementRepository);
      const traitements    = await getTraitements.execute(admissionId);
      res.status(200).json({ success: true, data: traitements, count: traitements.length });
    } catch (error) {
      console.error('Erreur récupération traitements:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  // ── GET /:id ──────────────────────────────────────────────────────────────────
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(getParam(req, 'id'), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID traitement invalide' });
        return;
      }
      const traitement = await this.traitementRepository.findById(id);
      if (!traitement) throw new NotFoundError('Traitement non trouvé');
      res.status(200).json({ success: true, data: traitement });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      console.error('Erreur récupération traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  // ── PUT /:id ──────────────────────────────────────────────────────────────────
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(getParam(req, 'id'), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID traitement invalide' });
        return;
      }
      const existing = await this.traitementRepository.findById(id);
      if (!existing) throw new NotFoundError('Traitement non trouvé');

      const validatedData = updateTraitementSchema.parse(req.body);
      const updateData: any = { ...validatedData };
      if (validatedData.date_prescription) {
        updateData.date_prescription = new Date(validatedData.date_prescription as string);
      }

      const traitement = await this.traitementRepository.update(id, updateData);
      res.status(200).json({ success: true, message: 'Traitement mis à jour avec succès', data: traitement });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      console.error('Erreur mise à jour traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  // ── DELETE /:id ───────────────────────────────────────────────────────────────
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(getParam(req, 'id'), 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID traitement invalide' });
        return;
      }
      const existing = await this.traitementRepository.findById(id);
      if (!existing) throw new NotFoundError('Traitement non trouvé');
      await this.traitementRepository.delete(id);
      res.status(200).json({ success: true, message: 'Traitement supprimé avec succès' });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      console.error('Erreur suppression traitement:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
}