// backend/src/domain/repositories/IPatientRepository.ts

import { Patient, CreatePatientDTO, UpdatePatientDTO, PatientFilters } from '../entities/Patient';
import { PaginatedResponse, PaginationParams } from '../../shared/types';

export interface IPatientRepository {
  findAll(params: PaginationParams, filters?: PatientFilters): Promise<PaginatedResponse<Patient>>;
  findById(id: number): Promise<Patient | null>;
  findByNumDossier(numDossier: string): Promise<Patient | null>;
  // ✅ FIX: Utiliser 'hospitalisé' avec accent
  findByStatus(status: 'externe' | 'hospitalisé', params: PaginationParams): Promise<PaginatedResponse<Patient>>;
  search(query: string): Promise<Patient[]>;
  create(data: CreatePatientDTO): Promise<Patient>;
  update(id: number, data: UpdatePatientDTO): Promise<Patient | null>;
  delete(id: number): Promise<void>;
  getStats(): Promise<{ total: number; externes: number; hospitalises: number }>;
}