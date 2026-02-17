import { IUtilisateurRepository } from '../../../domain/repositories/IUtilisateurRepository';
import { UtilisateurWithoutPassword } from '../../../domain/entities/Utilisateur';

export class GetUtilisateursByRole {
    constructor(private utilisateurRepository: IUtilisateurRepository) {}

    async execute(role: string): Promise<UtilisateurWithoutPassword[]> {
        return this.utilisateurRepository.findByRole(role);
    }
}