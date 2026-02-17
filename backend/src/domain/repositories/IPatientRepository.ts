import { Patient, CreatePatientDTO, UpdatePatientDTO, PatientFilters } from '../entities/Patient';
import { PaginatedResponse, PaginationParams } from '../../shared/types';

export interface IPatientRepository {
  create(data: CreatePatientDTO): Promise<Patient>;
  findById(id: number): Promise<Patient | null>;
  findByNumDossier(numDossier: string): Promise<Patient | null>;
  findAll(params: PaginationParams, filters?: PatientFilters): Promise<PaginatedResponse<Patient>>;
  findByStatus(status: 'externe' | 'hospitalise', params: PaginationParams): Promise<PaginatedResponse<Patient>>;
  search(query: string): Promise<Patient[]>;
  update(id: number, data: UpdatePatientDTO): Promise<Patient | null>;
  delete(id: number): Promise<void>;
  getStats(): Promise<{
    total: number;
    externes: number;
    hospitalises: number;
  }>;
}