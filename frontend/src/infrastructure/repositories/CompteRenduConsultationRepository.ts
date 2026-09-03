import { httpClient } from '../http/axios.config';
import type { CompteRenduConsultation, CreateCompteRenduConsultationDTO } from '../../core/entities/CompteRenduConsultation';

export class CompteRenduConsultationRepository {
  async getByPatientId(patientId: number): Promise<CompteRenduConsultation[]> {
    const response = await httpClient.get(`/comptes-rendus-consultation/patient/${patientId}`);
    return response.data.data;
  }

  async getById(id: number): Promise<CompteRenduConsultation> {
    const response = await httpClient.get(`/comptes-rendus-consultation/${id}`);
    return response.data.data;
  }

  async create(data: CreateCompteRenduConsultationDTO): Promise<CompteRenduConsultation> {
    const response = await httpClient.post('/comptes-rendus-consultation', data);
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateCompteRenduConsultationDTO>): Promise<CompteRenduConsultation> {
    const response = await httpClient.put(`/comptes-rendus-consultation/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await httpClient.delete(`/comptes-rendus-consultation/${id}`);
  }
}

export const compteRenduConsultationRepository = new CompteRenduConsultationRepository();