// backend/src/domain/repositories/IPieceJointeRepository.ts

import { PieceJointe, CreatePieceJointeDTO, EntiteType } from '../entities/PieceJointe';

export interface IPieceJointeRepository {
  create(data: CreatePieceJointeDTO): Promise<PieceJointe>;
  findByEntite(entiteType: EntiteType, entiteId: number): Promise<PieceJointe[]>;
  findById(id: number): Promise<PieceJointe | null>;
  delete(id: number): Promise<void>;
}