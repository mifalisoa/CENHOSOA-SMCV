import type { Patient, CreatePatientDTO } from '../entities/Patient';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IPatientRepository {
  getAll(page: number, limit: number): Promise<PaginatedResponse<Patient>>;
  getById(id: number): Promise<Patient>;
  create(patient: CreatePatientDTO): Promise<Patient>;
  update(id: number, patient: Partial<Patient>): Promise<Patient>;
  delete(id: number): Promise<void>;
  search(query: string): Promise<Patient[]>;
}