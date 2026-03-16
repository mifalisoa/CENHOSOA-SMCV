// frontend/src/infrastructure/repositories/RendezVousRepository.ts

import { httpClient } from '../http/axios.config';
import type { 
  RendezVous, 
  CreateRendezVousDTO, 
  UpdateRendezVousDTO,
  RendezVousFilters 
} from '../../core/entities/RendezVous';
import type { PaginatedResponse } from '../../shared/types';

export class RendezVousRepository {
  private baseURL = '/rendez-vous';

  /**
   * Récupérer tous les rendez-vous (avec filtres optionnels)
   */
  async getAll(filters?: RendezVousFilters): Promise<RendezVous[]> {
    const response = await httpClient.get(this.baseURL, { params: filters });
    return response.data.data || response.data;
  }

  /**
   * Récupérer les rendez-vous d'une date
   */
  async getByDate(date: string, docteurId?: number): Promise<RendezVous[]> {
    const params: Record<string, string | number> = { date };
    if (docteurId) {
      params.docteur_id = docteurId;
    }
    const response = await httpClient.get(this.baseURL, { params });
    return response.data.data || response.data;
  }

  /**
   * Récupérer les rendez-vous d'une période
   */
  async getByPeriod(dateDebut: string, dateFin: string): Promise<RendezVous[]> {
    const response = await httpClient.get(this.baseURL, {
      params: { date_debut: dateDebut, date_fin: dateFin }
    });
    return response.data.data || response.data;
  }

  /**
   * Récupérer les rendez-vous d'un patient
   */
  async getByPatient(patientId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<RendezVous>> {
    const response = await httpClient.get(this.baseURL, {
      params: { patient_id: patientId, page, limit }
    });
    return response.data.data || response.data;
  }

  /**
   * Récupérer les rendez-vous d'un docteur
   */
  async getByDocteur(docteurId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<RendezVous>> {
    const response = await httpClient.get(this.baseURL, {
      params: { docteur_id: docteurId, page, limit }
    });
    return response.data.data || response.data;
  }

  /**
   * Récupérer un rendez-vous par ID
   */
  async getById(id: number): Promise<RendezVous> {
    const response = await httpClient.get(`${this.baseURL}/${id}`);
    return response.data.data || response.data;
  }

  /**
   * Créer un nouveau rendez-vous
   */
  async create(data: CreateRendezVousDTO): Promise<RendezVous> {
    const response = await httpClient.post(this.baseURL, data);
    return response.data.data || response.data;
  }

  /**
   * Mettre à jour un rendez-vous
   */
  async update(id: number, data: UpdateRendezVousDTO): Promise<RendezVous> {
    const response = await httpClient.put(`${this.baseURL}/${id}`, data);
    return response.data.data || response.data;
  }

  /**
   * Supprimer un rendez-vous
   */
  async delete(id: number): Promise<void> {
    await httpClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Confirmer un rendez-vous
   */
  async confirm(id: number): Promise<RendezVous> {
    const response = await httpClient.patch(`${this.baseURL}/${id}/confirmer`);
    return response.data.data || response.data;
  }

  /**
   * Annuler un rendez-vous
   */
  async cancel(id: number, raison: string): Promise<RendezVous> {
    const response = await httpClient.patch(`${this.baseURL}/${id}/annuler`, { raison });
    return response.data.data || response.data;
  }

  /**
   * Marquer comme terminé
   */
  async complete(id: number): Promise<RendezVous> {
    const response = await httpClient.patch(`${this.baseURL}/${id}/terminer`);
    return response.data.data || response.data;
  }

  /**
   * Marquer comme absent
   */
  async markAbsent(id: number): Promise<RendezVous> {
    const response = await httpClient.patch(`${this.baseURL}/${id}/absent`);
    return response.data.data || response.data;
  }

  /**
   * Reporter un rendez-vous
   */
  async reschedule(id: number, nouvelleDate: string, nouvelleHeure: string): Promise<RendezVous> {
    const response = await httpClient.patch(`${this.baseURL}/${id}/reporter`, {
      nouvelle_date: nouvelleDate,
      nouvelle_heure: nouvelleHeure
    });
    return response.data.data || response.data;
  }

  /**
   * Récupérer les créneaux disponibles
   */
  async getAvailableSlots(
    docteurId: number,
    date: string,
    heureDebut: string = '08:00',
    heureFin: string = '18:00'
  ): Promise<string[]> {
    const response = await httpClient.get(`${this.baseURL}/creneaux-disponibles`, {
      params: {
        docteur_id: docteurId,
        date,
        heure_debut: heureDebut,
        heure_fin: heureFin
      }
    });
    return response.data.data || response.data;
  }
}

export const rendezVousRepository = new RendezVousRepository();