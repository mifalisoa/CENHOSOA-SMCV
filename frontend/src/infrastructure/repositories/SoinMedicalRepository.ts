import { httpClient } from '../http/axios.config';
import type { SoinMedical, CreateSoinMedicalDTO } from '../../core/entities/SoinMedical';
import type { ISoinMedicalRepository } from '../../core/repositories/ISoinMedicalRepository';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class SoinMedicalRepository implements ISoinMedicalRepository {
  async create(data: CreateSoinMedicalDTO): Promise<SoinMedical> {
    // Convertir date + heure en ISO datetime
    const isoDate = new Date(data.date_soin + 'T' + data.heure_soin + ':00Z').toISOString();
    
    const payload = {
      ...data,
      date_soin: isoDate,
    };

    const response = await httpClient.post<ApiResponse<SoinMedical>>(
      '/soins-medicaux',
      payload
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
    // Si date et heure fournis, convertir en ISO
    let payload: any = { ...data };
    
    if (data.date_soin && data.heure_soin) {
      const isoDate = new Date(data.date_soin + 'T' + data.heure_soin + ':00Z').toISOString();
      payload = {
        ...data,
        date_soin: isoDate,
      };
    }

    const response = await httpClient.put<ApiResponse<SoinMedical>>(
      `/soins-medicaux/${id}`,
      payload
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