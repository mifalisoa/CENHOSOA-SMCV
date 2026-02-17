import { IRendezVousRepository } from '../../../domain/repositories/IRendezVousRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class CancelRendezVous {
    constructor(private rendezVousRepository: IRendezVousRepository) {}

    async execute(id: number, raison: string): Promise<void> {
        // 1. Vérifier que le RDV existe
        const rdv = await this.rendezVousRepository.findById(id);
        if (!rdv) {
            throw new NotFoundError('Rendez-vous');
        }

        // 2. Vérifier que le RDV n'est pas déjà annulé ou terminé
        if (rdv.statut_rdv === 'annulé') {
            throw new ValidationError('Ce rendez-vous est déjà annulé');
        }
        if (rdv.statut_rdv === 'terminé') {
            throw new ValidationError('Impossible d\'annuler un rendez-vous terminé');
        }

        // 3. Annuler le RDV
        await this.rendezVousRepository.cancel(id, raison);
    }
}