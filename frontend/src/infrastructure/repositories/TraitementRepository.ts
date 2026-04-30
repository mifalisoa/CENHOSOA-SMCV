import { httpClient } from '../http/axios.config';
import type { Traitement, CreateTraitementDTO, CreateOrdonnanceDTO } from '../../core/entities/Traitement';
import type { ITraitementRepository } from '../../core/repositories/ITraitementRepository';
import type { StatutValidation } from '../../shared/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export class TraitementRepository implements ITraitementRepository {

  async create(data: CreateTraitementDTO): Promise<Traitement> {
    const response = await httpClient.post<ApiResponse<Traitement>>('/traitements', data);
    return response.data.data;
  }

  async createMany(data: CreateOrdonnanceDTO): Promise<Traitement[]> {
    const response = await httpClient.post<ApiResponse<Traitement[]>>('/traitements', data);
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<Traitement[]> {
    const response = await httpClient.get<ApiResponse<Traitement[]>>(`/traitements/patient/${patientId}`);
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<Traitement[]> {
    const response = await httpClient.get<ApiResponse<Traitement[]>>(`/traitements/admission/${admissionId}`);
    return response.data.data;
  }

  async getById(id: number): Promise<Traitement> {
    const response = await httpClient.get<ApiResponse<Traitement>>(`/traitements/${id}`);
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateTraitementDTO>): Promise<Traitement> {
    const response = await httpClient.put<ApiResponse<Traitement>>(`/traitements/${id}`, data);
    return response.data.data;
  }

  async valider(id: number, statut: StatutValidation): Promise<Traitement> {
    const response = await httpClient.patch<ApiResponse<Traitement>>(
      `/traitements/${id}/valider`,
      { statut }
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/traitements/${id}`);
  }
}