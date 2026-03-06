import { httpClient } from '../http/axios.config';
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
    // Construction de la date ISO : YYYY-MM-DD + T + HH:mm + :00Z
    const isoDate = new Date(`${data.date_prelevement}T${data.heure_prelevement}:00Z`).toISOString();
    
    const payload: CreateBilanBiologiqueDTO = {
      ...data,
      date_prelevement: isoDate,
    };

    const response = await httpClient.post<ApiResponse<BilanBiologique>>(
      '/bilans-biologiques',
      payload
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
    // Initialisation du payload avec le type correct (on évite le "any")
    let payload: Partial<CreateBilanBiologiqueDTO> = { ...data };
    
    // Si la date ET l'heure sont présentes dans les modifications
    if (data.date_prelevement && data.heure_prelevement) {
      const isoDate = new Date(`${data.date_prelevement}T${data.heure_prelevement}:00Z`).toISOString();
      payload = {
        ...data,
        date_prelevement: isoDate,
      };
    }

    const response = await httpClient.put<ApiResponse<BilanBiologique>>(
      `/bilans-biologiques/${id}`,
      payload
    );
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/bilans-biologiques/${id}`);
  }
}