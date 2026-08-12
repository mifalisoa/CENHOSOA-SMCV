// backend/src/application/use-cases/piece-jointe/GetPiecesJointesByEntite.ts

import { IPieceJointeRepository } from '../../../domain/repositories/IPieceJointeRepository';
import { PieceJointe, EntiteType } from '../../../domain/entities/PieceJointe';

export class GetPiecesJointesByEntite {
  constructor(private repository: IPieceJointeRepository) {}

  async execute(entiteType: EntiteType, entiteId: number): Promise<PieceJointe[]> {
    return this.repository.findByEntite(entiteType, entiteId);
  }
}