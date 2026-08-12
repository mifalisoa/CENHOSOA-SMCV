// frontend/src/core/repositories/IPieceJointeRepository.ts

import type { PieceJointe, CreatePieceJointeDTO, EntiteType } from '../entities/PieceJointe';

export interface IPieceJointeRepository {
  create(data: CreatePieceJointeDTO): Promise<PieceJointe>;
  getByEntite(entiteType: EntiteType, entiteId: number): Promise<PieceJointe[]>;
  delete(id: number): Promise<void>;
}