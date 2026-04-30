import type { Traitement, CreateTraitementDTO, CreateOrdonnanceDTO } from '../entities/Traitement';
import type { StatutValidation } from '../../shared/types';

export interface ITraitementRepository {
  create(data: CreateTraitementDTO): Promise<Traitement>;
  createMany(data: CreateOrdonnanceDTO): Promise<Traitement[]>;
  getByPatientId(patientId: number): Promise<Traitement[]>;
  getByAdmissionId(admissionId: number): Promise<Traitement[]>;
  getById(id: number): Promise<Traitement>;
  update(id: number, data: Partial<CreateTraitementDTO>): Promise<Traitement>;
  valider(id: number, statut: StatutValidation): Promise<Traitement>;
  delete(id: number): Promise<void>;
}