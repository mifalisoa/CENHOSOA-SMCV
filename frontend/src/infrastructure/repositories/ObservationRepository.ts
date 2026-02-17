import { httpClient } from '../http/axios.config'; // Correction de l'import
import type { Observation, CreateObservationDTO } from '../../core/entities/Observation';
import type { IObservationRepository } from '../../core/repositories/IObservationRepository';

// Interface de réponse standardisée
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class ObservationRepository implements IObservationRepository {
  async create(data: CreateObservationDTO): Promise<Observation> {
    const response = await httpClient.post<ApiResponse<Observation>>(
      '/observations',
      data
    );
    return response.data.data;
  }

  async getByPatientId(patientId: number, type?: 'externe' | 'hospitalise'): Promise<Observation[]> {
    const params = type ? { type } : {};
    const response = await httpClient.get<ApiResponse<Observation[]>>(
      `/observations/patient/${patientId}`,
      { params }
    );
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<Observation[]> {
    const response = await httpClient.get<ApiResponse<Observation[]>>(
      `/observations/admission/${admissionId}`
    );
    return response.data.data;
  }

  async getById(id: number): Promise<Observation> {
    const response = await httpClient.get<ApiResponse<Observation>>(
      `/observations/${id}`
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateObservationDTO>): Promise<Observation> {
    const response = await httpClient.put<ApiResponse<Observation>>(
      `/observations/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/observations/${id}`);
  }
}