// frontend/src/infrastructure/repositories/LitRepository.ts
//
// Implementation concrete de ILitRepository, sur le modele de AdmissionRepository.ts.
//
// DIFFERENCE CRITIQUE avec AdmissionRepository :
// AdmissionController utilise successResponse() -> le body HTTP est { success, data, message },
// donc AdmissionRepository lit response.data.data.
// LitController fait res.json(x) directement -> le body HTTP EST x, sans wrapper,
// donc ici on lit response.data tout court. Ne pas copier le .data.data d'Admission ici,
// ca renverrait undefined silencieusement.

import { httpClient } from '../http/axios.config';
import { API_ENDPOINTS } from '../../shared/constants/api.constants';
import type { ILitRepository, LitStatistiques } from '../../core/repositories/ILitRepository';
import type { Lit, LitWithOccupation, CreateLitDTO, UpdateLitDTO } from '../../core/entities/Lit';

export class LitRepository implements ILitRepository {
  async getAll(): Promise<LitWithOccupation[]> {
    const response = await httpClient.get(API_ENDPOINTS.LITS);
    // Pas de wrapper : le backend renvoie directement le tableau des lits.
    return response.data;
  }

  async getStatistiques(): Promise<LitStatistiques> {
    const response = await httpClient.get(API_ENDPOINTS.LITS_STATISTIQUES);
    return response.data;
  }

  async getById(id: number): Promise<Lit> {
    const response = await httpClient.get(API_ENDPOINTS.LIT_BY_ID(id));
    return response.data;
  }

  async create(data: CreateLitDTO): Promise<Lit> {
    const response = await httpClient.post(API_ENDPOINTS.LITS, data);
    return response.data;
  }

  async update(id: number, data: UpdateLitDTO): Promise<Lit> {
    const response = await httpClient.put(API_ENDPOINTS.LIT_BY_ID(id), data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    // Le backend repond 204 No Content : pas de corps de reponse a lire ici.
    await httpClient.delete(API_ENDPOINTS.LIT_BY_ID(id));
  }

  async liberer(id: number): Promise<Lit> {
    // Endpoint POST sans body attendu cote backend (route lit.routes.ts : pas de validateRequest ici).
    const response = await httpClient.post(API_ENDPOINTS.LIT_LIBERER(id));
    return response.data;
  }

  async initialiser(): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.post(API_ENDPOINTS.LITS_INITIALISER);
    return response.data;
  }
}

export const litRepository = new LitRepository();