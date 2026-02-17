import { httpClient } from '../http/axios.config'; // Correction du membre exporté
import type { DocumentPatient, CreateDocumentPatientDTO } from '../../core/entities/DocumentPatient';
import type { IDocumentPatientRepository } from '../../core/repositories/IDocumentPatientRepository';

// Interface pour typer les réponses standard du backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class DocumentPatientRepository implements IDocumentPatientRepository {
  async create(data: CreateDocumentPatientDTO): Promise<DocumentPatient> {
    const response = await httpClient.post<ApiResponse<DocumentPatient>>(
      '/documents-patients',
      data
    );
    return response.data.data;
  }

  async getByPatientId(patientId: number): Promise<DocumentPatient[]> {
    const response = await httpClient.get<ApiResponse<DocumentPatient[]>>(
      `/documents-patients/patient/${patientId}`
    );
    return response.data.data;
  }

  async getByAdmissionId(admissionId: number): Promise<DocumentPatient[]> {
    const response = await httpClient.get<ApiResponse<DocumentPatient[]>>(
      `/documents-patients/admission/${admissionId}`
    );
    return response.data.data;
  }

  async getById(id: number): Promise<DocumentPatient> {
    const response = await httpClient.get<ApiResponse<DocumentPatient>>(
      `/documents-patients/${id}`
    );
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateDocumentPatientDTO>): Promise<DocumentPatient> {
    const response = await httpClient.put<ApiResponse<DocumentPatient>>(
      `/documents-patients/${id}`,
      data
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/documents-patients/${id}`);
  }
}