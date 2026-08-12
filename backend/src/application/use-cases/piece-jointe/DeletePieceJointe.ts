// backend/src/application/use-cases/piece-jointe/DeletePieceJointe.ts

import { IPieceJointeRepository } from '../../../domain/repositories/IPieceJointeRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';

export class DeletePieceJointe {
  constructor(private repository: IPieceJointeRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Pièce jointe non trouvée');
    await this.repository.delete(id);
  }
}