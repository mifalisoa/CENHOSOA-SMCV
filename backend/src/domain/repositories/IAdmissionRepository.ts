import { Admission, CreateAdmissionDTO, UpdateAdmissionDTO } from '../entities/Admission';
import { PaginatedResponse, PaginationParams } from '../../shared/types';

export interface IAdmissionRepository {
    create(data: CreateAdmissionDTO): Promise<Admission>;
    findById(id: number): Promise<Admission | null>;
    findAll(params: PaginationParams): Promise<PaginatedResponse<Admission>>;
    findByPatient(idPatient: number): Promise<Admission[]>;
    findEnCours(): Promise<Admission[]>;
    update(id: number, data: UpdateAdmissionDTO): Promise<Admission | null>;
    assignLit(idAdmission: number, idLit: number): Promise<boolean>;
    cloturer(idAdmission: number): Promise<boolean>;
    generateNumAdmission(): Promise<string>;
}