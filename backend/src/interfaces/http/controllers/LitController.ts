import { Request, Response } from 'express';
// On remonte 3 fois pour atteindre 'src', puis on redescend dans les bons dossiers
import { LitService } from '../../../application/services/LitService';
import { CreateLitDTO, UpdateLitDTO } from '../../../domain/entities/Lit';
export class LitController {
  constructor(private litService: LitService) {}

  /**
   * GET /api/lits - Récupérer tous les lits avec occupation
   */
  getAllLits = async (req: Request, res: Response): Promise<void> => {
    try {
      const lits = await this.litService.getAllLitsWithOccupation();
      res.json(lits);
    } catch (error: any) {
      console.error('Erreur récupération lits:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des lits',
        details: error.message 
      });
    }
  };

  /**
   * GET /api/lits/statistiques - Statistiques des lits
   */
  getStatistiques = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.litService.getStatistiques();
      res.json(stats);
    } catch (error: any) {
      console.error('Erreur statistiques lits:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques',
        details: error.message 
      });
    }
  };

  /**
   * GET /api/lits/:id - Récupérer un lit par ID
   */
  getLitById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const lit = await this.litService.getLitById(id);

      if (!lit) {
        res.status(404).json({ error: 'Lit non trouvé' });
        return;
      }

      res.json(lit);
    } catch (error: any) {
      console.error('Erreur récupération lit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération du lit',
        details: error.message 
      });
    }
  };

  /**
   * POST /api/lits - Créer un nouveau lit
   */
  createLit = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateLitDTO = req.body;

      // Validation
      if (!data.numero_lit || !data.categorie) {
        res.status(400).json({ error: 'Numéro et catégorie requis' });
        return;
      }

      const lit = await this.litService.createLit(data);
      res.status(201).json(lit);
    } catch (error: any) {
      console.error('Erreur création lit:', error);
      
      // Gestion erreur de doublon
      if (error.code === '23505') {
        res.status(409).json({ error: 'Ce numéro de lit existe déjà' });
        return;
      }

      res.status(500).json({ 
        error: 'Erreur lors de la création du lit',
        details: error.message 
      });
    }
  };

  /**
   * PUT /api/lits/:id - Mettre à jour un lit
   */
  updateLit = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const data: UpdateLitDTO = req.body;

      const lit = await this.litService.updateLit(id, data);

      if (!lit) {
        res.status(404).json({ error: 'Lit non trouvé' });
        return;
      }

      res.json(lit);
    } catch (error: any) {
      console.error('Erreur mise à jour lit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la mise à jour du lit',
        details: error.message 
      });
    }
  };

  /**
   * DELETE /api/lits/:id - Supprimer un lit
   */
  deleteLit = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const success = await this.litService.deleteLit(id);

      if (!success) {
        res.status(404).json({ error: 'Lit non trouvé' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('Erreur suppression lit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la suppression du lit',
        details: error.message 
      });
    }
  };

  /**
   * POST /api/lits/:id/liberer - Libérer un lit
   */
  libererLit = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const lit = await this.litService.libererLit(id);

      if (!lit) {
        res.status(404).json({ error: 'Lit non trouvé' });
        return;
      }

      res.json(lit);
    } catch (error: any) {
      console.error('Erreur libération lit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la libération du lit',
        details: error.message 
      });
    }
  };

  /**
   * POST /api/lits/initialiser - Initialiser les 24 lits CENHOSOA
   */
  initialiserLits = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.litService.initialiserLitsCENHOSOA();
      res.json({ 
        success: true, 
        message: '24 lits CENHOSOA initialisés avec succès (5 Cat.1 + 8 Cat.2 + 4 Cat.3 + 3 USIC)' 
      });
    } catch (error: any) {
      console.error('Erreur initialisation lits:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'initialisation des lits',
        details: error.message 
      });
    }
  };
}