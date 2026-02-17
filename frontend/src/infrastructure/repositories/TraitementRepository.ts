import { httpClient } from '../http/axios.config'; // Correction de l'export
import type { Traitement, CreateTraitementDTO } from '../../core/entities/Traitement';
import type { ITraitementRepository } from '../../core/repositories/ITraitementRepository';

// Interface de réponse standardisée
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class TraitementRepository implements ITraitementRepository {
  async create(data: CreateTraitementDTO): Promise<Traitement> {
    const response = await httpClient.post<ApiResponse<Traitement>>(
      '/traitements',
      data
    );
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<Traitement[]> {
    const response = await httpClient.get<ApiResponse<Traitement[]>>(
      `/traitements/patient/${patientId}`
    );
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<Traitement[]> {
    const response = await httpClient.get<ApiResponse<Traitement[]>>(
      `/traitements/admission/${admissionId}`
    );
    return response.data.data;
  }

  async getById(id: number): Promise<Traitement> {
    const response = await httpClient.get<ApiResponse<Traitement>>(
      `/traitements/${id}`
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateTraitementDTO>): Promise<Traitement> {
    const response = await httpClient.put<ApiResponse<Traitement>>(
      `/traitements/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/traitements/${id}`);
  }
}