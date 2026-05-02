import { httpClient } from '../http/axios.config';
import type { EvolutionPatient, CreateEvolutionPatientDTO } from '../../core/entities/EvolutionPatient';
import type { IEvolutionPatientRepository } from '../../core/repositories/IEvolutionPatientRepository';

interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
  count?:  number;
}

export class EvolutionPatientRepository implements IEvolutionPatientRepository {

  async create(data: CreateEvolutionPatientDTO): Promise<EvolutionPatient> {
    const response = await httpClient.post<ApiResponse<EvolutionPatient>>('/evolutions', data);
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<EvolutionPatient[]> {
    const response = await httpClient.get<ApiResponse<EvolutionPatient[]>>(
      `/evolutions/patient/${patientId}`
    );
    return response.data.data;
  }

  async getByObservationId(observationId: number): Promise<EvolutionPatient[]> {
    const response = await httpClient.get<ApiResponse<EvolutionPatient[]>>(
      `/evolutions/observation/${observationId}`
    );
    return response.data.data;
  }

  async getById(id: number): Promise<EvolutionPatient> {
    const response = await httpClient.get<ApiResponse<EvolutionPatient>>(`/evolutions/${id}`);
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateEvolutionPatientDTO>): Promise<EvolutionPatient> {
    const response = await httpClient.put<ApiResponse<EvolutionPatient>>(`/evolutions/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/evolutions/${id}`);
  }
}