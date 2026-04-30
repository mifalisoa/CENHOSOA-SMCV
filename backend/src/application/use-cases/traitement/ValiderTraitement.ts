import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement } from '../../../domain/entities/Traitement';
import { StatutValidation, ROLES_VALIDATEURS, RoleType } from '../../../shared/types';

export interface ValiderTraitementInput {
  id:              number;
  statut:          StatutValidation;
  validateur_id:   number;
  validateur_role: RoleType;
  mode_garde:      boolean;
}

export class ValiderTraitement {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(input: ValiderTraitementInput): Promise<Traitement> {
    // ── Règle métier : seul un médecin peut valider ──────────────────────────
    if (!ROLES_VALIDATEURS.includes(input.validateur_role)) {
      throw new Error('Seul un médecin peut valider une prescription');
    }

    // ── Vérification existence ───────────────────────────────────────────────
    const traitement = await this.traitementRepository.findById(input.id);
    if (!traitement) {
      throw new Error('Traitement non trouvé');
    }

    // ── Règle métier : statut en_attente requis sauf mode garde ─────────────
    if (traitement.statut !== 'en_attente' && !input.mode_garde) {
      throw new Error(`Ce traitement est déjà ${traitement.statut} et ne peut plus être modifié`);
    }

    return await this.traitementRepository.valider(
      input.id,
      input.statut,
      input.validateur_id,
      input.mode_garde,
    );
  }
}