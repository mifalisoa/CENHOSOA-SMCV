import { Prescription, CreatePrescriptionDTO, UpdatePrescriptionDTO, StatutPrescription } from '../entities/Prescription';

export interface IPrescriptionRepository {
    create(data: CreatePrescriptionDTO & { statut: StatutPrescription }): Promise<Prescription>;
    findById(id: number): Promise<Prescription | null>;
    findByAdmission(idAdmission: number): Promise<Prescription[]>;
    findByType(idAdmission: number, type: string): Promise<Prescription[]>;
    update(id: number, data: UpdatePrescriptionDTO): Promise<Prescription | null>;
    delete(id: number): Promise<boolean>;
    valider(id: number, statut: StatutPrescription, validateurId: number, modeGarde: boolean): Promise<Prescription | null>;
}