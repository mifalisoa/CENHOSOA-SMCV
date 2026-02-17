import { Prescription, CreatePrescriptionDTO, UpdatePrescriptionDTO } from '../entities/Prescription';

export interface IPrescriptionRepository {
    create(data: CreatePrescriptionDTO): Promise<Prescription>;
    findById(id: number): Promise<Prescription | null>;
    findByAdmission(idAdmission: number): Promise<Prescription[]>;
    findByType(idAdmission: number, type: string): Promise<Prescription[]>;
    update(id: number, data: UpdatePrescriptionDTO): Promise<Prescription | null>;
    delete(id: number): Promise<boolean>;
}