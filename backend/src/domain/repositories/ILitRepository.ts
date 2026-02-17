import { Lit, CreateLitDTO, UpdateLitDTO } from '../entities/Lit';

export interface ILitRepository {
    create(data: CreateLitDTO): Promise<Lit>;
    findById(id: number): Promise<Lit | null>;
    findAll(): Promise<Lit[]>;
    findAvailable(service?: string): Promise<Lit[]>;
    update(id: number, data: UpdateLitDTO): Promise<Lit | null>;
    updateStatus(id: number, status: string): Promise<boolean>;
    isAvailable(id: number): Promise<boolean>;
}