import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { PaginatedResponse, PaginationParams } from '../../../shared/types';
import { UtilisateurWithoutPassword } from '../../../domain/entities/Utilisateur';

export class ListUtilisateurs {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(params: PaginationParams): Promise<PaginatedResponse<UtilisateurWithoutPassword>> {
        return this.utilisateurRepository.findAll(params);
    }
}