import type { Admission, CreateAdmissionDTO,  } from '../entities/Admission';
import type { PaginatedResponse } from './IPatientRepository';

export interface IAdmissionRepository {
  getAll(page: number, limit: number): Promise<PaginatedResponse<Admission>>;
  getById(id: number): Promise<Admission>;
  getEnCours(): Promise<Admission[]>;
  create(data: CreateAdmissionDTO): Promise<Admission>;
  assignLit(id: number, idLit: number): Promise<void>;
  cloturer(id: number): Promise<void>;
}