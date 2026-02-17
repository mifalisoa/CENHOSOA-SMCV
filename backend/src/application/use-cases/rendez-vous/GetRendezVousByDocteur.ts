import { IRendezVousRepository } from '../../../domain/repositories/IRendezVousRepository';
import { PaginatedResponse, PaginationParams } from '../../../shared/types';
import { RendezVous } from '../../../domain/entities/RendezVous';

export class GetRendezVousByDocteur {
    constructor(private rendezVousRepository: IRendezVousRepository) {}

    async execute(idDocteur: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>> {
        return this.rendezVousRepository.findByDocteur(idDocteur, params);
    }
}