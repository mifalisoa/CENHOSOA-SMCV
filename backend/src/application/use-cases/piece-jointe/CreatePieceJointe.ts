// backend/src/application/use-cases/piece-jointe/CreatePieceJointe.ts

import { IPieceJointeRepository } from '../../../domain/repositories/IPieceJointeRepository';
import { PieceJointe, CreatePieceJointeDTO } from '../../../domain/entities/PieceJointe';

export class CreatePieceJointe {
  constructor(private repository: IPieceJointeRepository) {}

  async execute(data: CreatePieceJointeDTO): Promise<PieceJointe> {
    return this.repository.create(data);
  }
}