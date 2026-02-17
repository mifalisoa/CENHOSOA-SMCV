import { httpClient } from '../http/axios.config';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';
import type { Patient, CreatePatientDTO, PaginatedPatients } from '../../core/entities/Patient';

export class PatientRepository {
  async getAll(page = 1, limit = 10): Promise<PaginatedPatients> {
    const response = await httpClient.get(API_ENDPOINTS.PATIENTS, {
      params: { page, limit }
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  }

  async getExternes(page = 1, limit = 10): Promise<PaginatedPatients> {
    const response = await httpClient.get(API_ENDPOINTS.PATIENTS_EXTERNES, {
      params: { page, limit }
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  }

  async getHospitalises(page = 1, limit = 10): Promise<PaginatedPatients> {
    const response = await httpClient.get(API_ENDPOINTS.PATIENTS_HOSPITALISES, {
      params: { page, limit }
    });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  }

  async getById(id: number): Promise<Patient> {
    const response = await httpClient.get(API_ENDPOINTS.PATIENT_BY_ID(id));
    return response.data.data;
  }

  async search(query: string): Promise<Patient[]> {
    const response = await httpClient.get(API_ENDPOINTS.PATIENTS_SEARCH, {
      params: { q: query }
    });
    return response.data.data;
  }

  async getStats(): Promise<{ total: number; externes: number; hospitalises: number }> {
    const response = await httpClient.get(API_ENDPOINTS.PATIENTS_STATS);
    return response.data.data;
  }

  async create(data: CreatePatientDTO): Promise<Patient> {
    console.log('🔵 [Repository] Création patient:', data);
    const response = await httpClient.post(API_ENDPOINTS.PATIENTS, data);
    console.log('✅ [Repository] Patient créé:', response.data);
    return response.data.data;
  }

  async update(id: number, data: Partial<CreatePatientDTO>): Promise<Patient> {
    const response = await httpClient.put(API_ENDPOINTS.PATIENT_BY_ID(id), data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(API_ENDPOINTS.PATIENT_BY_ID(id));
  }
}

export const patientRepository = new PatientRepository();