// backend/src/interfaces/http/controllers/PieceJointeController.ts

import { Response } from 'express';
import { CreatePieceJointe } from '../../../application/use-cases/piece-jointe/CreatePieceJointe';
import { GetPiecesJointesByEntite } from '../../../application/use-cases/piece-jointe/GetPiecesJointesByEntite';
import { DeletePieceJointe } from '../../../application/use-cases/piece-jointe/DeletePieceJointe';
import { IPieceJointeRepository } from '../../../domain/repositories/IPieceJointeRepository';
import { EntiteType } from '../../../domain/entities/PieceJointe';
import { createPieceJointeSchema } from '../validators/piece-jointe.validator';
import { ZodError } from 'zod';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PieceJointeController {
  constructor(private repository: IPieceJointeRepository) {}

  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validatedData = createPieceJointeSchema.parse(req.body);

      // Traçabilité : on utilise l'utilisateur connecté plutôt que de faire confiance au frontend
      const ajoutePar = `${req.user?.prenom ?? ''} ${req.user?.nom ?? ''}`.trim() || undefined;

      const createPieceJointe = new CreatePieceJointe(this.repository);
      const pieceJointe = await createPieceJointe.execute({
        ...validatedData,
        ajoute_par: ajoutePar,
      });

      res.status(201).json({ success: true, message: 'Pièce jointe ajoutée avec succès', data: pieceJointe });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, message: 'Erreur de validation', errors: error.issues });
        return;
      }
      console.error('Erreur création pièce jointe:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  getByEntite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const entiteType = req.params.entiteType as EntiteType;
      const entiteId    = parseInt(req.params.entiteId as string, 10);

      if (isNaN(entiteId)) {
        res.status(400).json({ success: false, message: 'ID entité invalide' });
        return;
      }

      const getPiecesJointes = new GetPiecesJointesByEntite(this.repository);
      const piecesJointes = await getPiecesJointes.execute(entiteType, entiteId);

      res.status(200).json({ success: true, data: piecesJointes, count: piecesJointes.length });
    } catch (error) {
      console.error('Erreur récupération pièces jointes:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };

  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID invalide' });
        return;
      }

      const deletePieceJointe = new DeletePieceJointe(this.repository);
      await deletePieceJointe.execute(id);

      res.status(200).json({ success: true, message: 'Pièce jointe supprimée avec succès' });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      console.error('Erreur suppression pièce jointe:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
}