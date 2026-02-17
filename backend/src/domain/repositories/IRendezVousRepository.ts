import { RendezVous, CreateRendezVousDTO, UpdateRendezVousDTO } from '../entities/RendezVous';
import { PaginatedResponse, PaginationParams } from '../../shared/types';

export interface IRendezVousRepository {
    create(data: CreateRendezVousDTO): Promise<RendezVous>;
    findById(id: number): Promise<RendezVous | null>;
    findByPatient(idPatient: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>>;
    findByDocteur(idDocteur: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>>;
    findByDate(date: Date, idDocteur?: number): Promise<RendezVous[]>;
    update(id: number, data: UpdateRendezVousDTO): Promise<RendezVous | null>;
    cancel(id: number, raison: string): Promise<boolean>;
    confirm(id: number): Promise<boolean>;
    complete(id: number): Promise<boolean>;
    checkAvailability(idDocteur: number, date: Date, heure: string): Promise<boolean>;
}