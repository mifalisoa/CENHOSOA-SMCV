// frontend/src/infrastructure/repositories/PieceJointeRepository.ts

import { httpClient } from '../http/axios.config';
import type { IPieceJointeRepository } from '../../core/repositories/IPieceJointeRepository';
import type { PieceJointe, CreatePieceJointeDTO, EntiteType } from '../../core/entities/PieceJointe';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class PieceJointeRepository implements IPieceJointeRepository {

  async create(data: CreatePieceJointeDTO): Promise<PieceJointe> {
    const response = await httpClient.post<ApiResponse<PieceJointe>>('/pieces-jointes', data);
    return response.data.data;
  }

  async getByEntite(entiteType: EntiteType, entiteId: number): Promise<PieceJointe[]> {
    const response = await httpClient.get<ApiResponse<PieceJointe[]>>(`/pieces-jointes/${entiteType}/${entiteId}`);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/pieces-jointes/${id}`);
  }
}