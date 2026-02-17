import { httpClient } from '../http/axios.config'; // Correction de l'import
import type { CompteRendu, CreateCompteRenduDTO } from '../../core/entities/CompteRendu';
import type { ICompteRenduRepository } from '../../core/repositories/ICompteRenduRepository';

// Interface pour uniformiser les réponses API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class CompteRenduRepository implements ICompteRenduRepository {
  async create(data: CreateCompteRenduDTO): Promise<CompteRendu> {
    const response = await httpClient.post<ApiResponse<CompteRendu>>(
      '/comptes-rendus',
      data
    );
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<CompteRendu[]> {
    const response = await httpClient.get<ApiResponse<CompteRendu[]>>(
      `/comptes-rendus/patient/${patientId}`
    );
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<CompteRendu | null> {
    try {
      const response = await httpClient.get<ApiResponse<CompteRendu>>(
        `/comptes-rendus/admission/${admissionId}`
      );
      return response.data.data;
    } catch (error: unknown) {
      // ✅ Correction du type 'any' pour ESLint
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  }

  async getById(id: number): Promise<CompteRendu> {
    const response = await httpClient.get<ApiResponse<CompteRendu>>(
      `/comptes-rendus/${id}`
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateCompteRenduDTO>): Promise<CompteRendu> {
    const response = await httpClient.put<ApiResponse<CompteRendu>>(
      `/comptes-rendus/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/comptes-rendus/${id}`);
  }
}