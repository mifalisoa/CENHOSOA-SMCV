import { httpClient } from '../http/axios.config'; // Correction de l'import
import type { SoinMedical, CreateSoinMedicalDTO } from '../../core/entities/SoinMedical';
import type { ISoinMedicalRepository } from '../../core/repositories/ISoinMedicalRepository';

// Interface de réponse standardisée pour la couche infrastructure
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class SoinMedicalRepository implements ISoinMedicalRepository {
  async create(data: CreateSoinMedicalDTO): Promise<SoinMedical> {
    const response = await httpClient.post<ApiResponse<SoinMedical>>(
      '/soins-medicaux',
      data
    );
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<SoinMedical[]> {
    const response = await httpClient.get<ApiResponse<SoinMedical[]>>(
      `/soins-medicaux/patient/${patientId}`
    );
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<SoinMedical[]> {
    const response = await httpClient.get<ApiResponse<SoinMedical[]>>(
      `/soins-medicaux/admission/${admissionId}`
    );
    return response.data.data;
  }

  async getById(id: number): Promise<SoinMedical> {
    const response = await httpClient.get<ApiResponse<SoinMedical>>(
      `/soins-medicaux/${id}`
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateSoinMedicalDTO>): Promise<SoinMedical> {
    const response = await httpClient.put<ApiResponse<SoinMedical>>(
      `/soins-medicaux/${id}`,
      data
    );
    return response.data.data;
  }

  async verify(id: number): Promise<SoinMedical> {
    const response = await httpClient.patch<ApiResponse<SoinMedical>>(
      `/soins-medicaux/${id}/verify`
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/soins-medicaux/${id}`);
  }
}