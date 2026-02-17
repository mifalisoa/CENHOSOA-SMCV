import { IRendezVousRepository } from '../../../domain/repositories/IRendezVousRepository';
import { PaginatedResponse, PaginationParams } from '../../../shared/types';
import { RendezVous } from '../../../domain/entities/RendezVous';

export class GetRendezVousByPatient {
    constructor(private rendezVousRepository: IRendezVousRepository) {}

    async execute(idPatient: number, params: PaginationParams): Promise<PaginatedResponse<RendezVous>> {
        return this.rendezVousRepository.findByPatient(idPatient, params);
    }
}