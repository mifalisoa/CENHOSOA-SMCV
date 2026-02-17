import { httpClient } from '../http/axios.config'; // Changement de apiClient vers httpClient
import type { BilanBiologique, CreateBilanBiologiqueDTO } from '../../core/entities/BilanBiologique';
import type { IBilanBiologiqueRepository } from '../../core/repositories/IBilanBiologiqueRepository';

// Interface générique pour centraliser la structure des réponses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class BilanBiologiqueRepository implements IBilanBiologiqueRepository {
  async create(data: CreateBilanBiologiqueDTO): Promise<BilanBiologique> {
    const response = await httpClient.post<ApiResponse<BilanBiologique>>(
      '/bilans-biologiques',
      data
    );
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<BilanBiologique[]> {
    const response = await httpClient.get<ApiResponse<BilanBiologique[]>>(
      `/bilans-biologiques/patient/${patientId}`
    );
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<BilanBiologique[]> {
    const response = await httpClient.get<ApiResponse<BilanBiologique[]>>(
      `/bilans-biologiques/admission/${admissionId}`
    );
    return response.data.data;
  }

  async getById(id: number): Promise<BilanBiologique> {
    const response = await httpClient.get<ApiResponse<BilanBiologique>>(
      `/bilans-biologiques/${id}`
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateBilanBiologiqueDTO>): Promise<BilanBiologique> {
    const response = await httpClient.put<ApiResponse<BilanBiologique>>(
      `/bilans-biologiques/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/bilans-biologiques/${id}`);
  }
}