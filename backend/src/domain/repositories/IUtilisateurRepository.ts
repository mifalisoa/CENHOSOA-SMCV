import { Utilisateur, CreateUtilisateurDTO, UpdateUtilisateurDTO, UtilisateurWithoutPassword } from '../entities/Utilisateur';
import { PaginatedResponse, PaginationParams } from '../../shared/types';

export interface IUtilisateurRepository {
    create(data: CreateUtilisateurDTO): Promise<Utilisateur>;
    findById(id: number): Promise<Utilisateur | null>;
    findByEmail(email: string): Promise<Utilisateur | null>;
    findAll(params: PaginationParams): Promise<PaginatedResponse<UtilisateurWithoutPassword>>;
    findByRole(role: string): Promise<UtilisateurWithoutPassword[]>;
    findActive(): Promise<UtilisateurWithoutPassword[]>;
    update(id: number, data: UpdateUtilisateurDTO): Promise<Utilisateur | null>;
    updatePassword(id: number, newPassword: string): Promise<boolean>;
    deactivate(id: number): Promise<boolean>;
    activate(id: number): Promise<boolean>;
    updateLastLogin(id: number): Promise<void>;
    emailExists(email: string, excludeId?: number): Promise<boolean>;
}