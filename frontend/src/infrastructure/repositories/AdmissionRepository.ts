import { httpClient } from '../http/axios.config';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';
import type { IAdmissionRepository } from '../../core/repositories/IAdmissionRepository';
import type { Admission, CreateAdmissionDTO } from '../../core/entities/Admission';
import type { PaginatedResponse } from '../../core/repositories/IPatientRepository';

export class AdmissionRepository implements IAdmissionRepository {
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Admission>> {
    const response = await httpClient.get(API_ENDPOINTS.ADMISSIONS, {
      params: { page, limit }
    });
    return {
      data: response.data.data.data,
      pagination: response.data.data.pagination
    };
  }

  async getById(id: number): Promise<Admission> {
    const response = await httpClient.get(API_ENDPOINTS.ADMISSION_BY_ID(id));
    return response.data.data;
  }

  async getEnCours(): Promise<Admission[]> {
    const response = await httpClient.get(API_ENDPOINTS.ADMISSIONS_EN_COURS);
    return response.data.data;
  }

  async create(data: CreateAdmissionDTO): Promise<Admission> {
    const response = await httpClient.post(API_ENDPOINTS.ADMISSIONS, data);
    return response.data.data;
  }

  async assignLit(id: number, idLit: number): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.ADMISSION_ASSIGN_LIT(id), { id_lit: idLit });
  }

  async cloturer(id: number): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.ADMISSION_CLOTURER(id), {});
  }
}

export const admissionRepository = new AdmissionRepository();