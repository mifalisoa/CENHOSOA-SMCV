import { IRendezVousRepository } from '../../../domain/repositories/IRendezVousRepository';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { ValidationError } from '../../../shared/errors/ValidationError';

export class ConfirmRendezVous {
    constructor(private rendezVousRepository: IRendezVousRepository) {}

    async execute(id: number): Promise<void> {
        // 1. Vérifier que le RDV existe
        const rdv = await this.rendezVousRepository.findById(id);
        if (!rdv) {
            throw new NotFoundError('Rendez-vous');
        }

        // 2. Vérifier que le RDV est planifié
        if (rdv.statut_rdv !== 'planifié') {
            throw new ValidationError('Seul un rendez-vous planifié peut être confirmé');
        }

        // 3. Confirmer le RDV
        const success = await this.rendezVousRepository.confirm(id);
        if (!success) {
            throw new ValidationError('Impossible de confirmer ce rendez-vous');
        }
    }
}