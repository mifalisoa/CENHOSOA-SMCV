import { httpClient } from '../http/axios.config';
import type { SoinInfirmier, CreateSoinInfirmierDTO } from '../../core/entities/SoinInfirmier';
import type { ISoinInfirmierRepository } from '../../core/repositories/ISoinInfirmierRepository';
import type { StatutValidation } from '../../shared/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class SoinInfirmierRepository implements ISoinInfirmierRepository {

  async create(data: CreateSoinInfirmierDTO): Promise<SoinInfirmier> {
    const response = await httpClient.post<ApiResponse<SoinInfirmier>>(
      '/soins-infirmiers',
      data
    );
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<SoinInfirmier[]> {
    const response = await httpClient.get<ApiResponse<SoinInfirmier[]>>(
      `/soins-infirmiers/patient/${patientId}`
    );
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<SoinInfirmier[]> {
    const response = await httpClient.get<ApiResponse<SoinInfirmier[]>>(
      `/soins-infirmiers/admission/${admissionId}`
    );
    return response.data.data;
  }

  async getById(id: number): Promise<SoinInfirmier> {
    const response = await httpClient.get<ApiResponse<SoinInfirmier>>(
      `/soins-infirmiers/${id}`
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateSoinInfirmierDTO>): Promise<SoinInfirmier> {
    const response = await httpClient.put<ApiResponse<SoinInfirmier>>(
      `/soins-infirmiers/${id}`,
      data
    );
    return response.data.data;
  }

  /** @deprecated utiliser valider() */
  async verify(id: number): Promise<SoinInfirmier> {
    const response = await httpClient.patch<ApiResponse<SoinInfirmier>>(
      `/soins-infirmiers/${id}/verify`
    );
    return response.data.data;
  }

  async valider(id: number, statut: StatutValidation): Promise<SoinInfirmier> {
    const response = await httpClient.patch<ApiResponse<SoinInfirmier>>(
      `/soins-infirmiers/${id}/valider`,
      { statut }
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/soins-infirmiers/${id}`);
  }
}