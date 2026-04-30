import { ISoinInfirmierRepository } from '../../../domain/repositories/ISoinInfirmierRepository';
import { SoinInfirmier } from '../../../domain/entities/SoinInfirmier';
import { StatutValidation, ROLES_VALIDATEURS, RoleType } from '../../../shared/types';

export interface ValiderSoinInfirmierInput {
  id:              number;
  statut:          StatutValidation;
  validateur_id:   number;
  validateur_role: RoleType;
  mode_garde:      boolean;
}

export class ValiderSoinInfirmier {
  constructor(private soinRepository: ISoinInfirmierRepository) {}

  async execute(input: ValiderSoinInfirmierInput): Promise<SoinInfirmier> {
    // ── Règle métier : seul un médecin peut valider ──────────────────────────
    if (!ROLES_VALIDATEURS.includes(input.validateur_role)) {
      throw new Error('Seul un médecin peut valider un acte infirmier');
    }

    // ── Vérification existence ───────────────────────────────────────────────
    const soin = await this.soinRepository.findById(input.id);
    if (!soin) {
      throw new Error('Soin infirmier non trouvé');
    }

    // ── Règle métier : statut en_attente requis sauf mode garde ─────────────
    if (soin.statut !== 'en_attente' && !input.mode_garde) {
      throw new Error(`Cet acte est déjà ${soin.statut} et ne peut plus être modifié`);
    }

    return await this.soinRepository.valider(
      input.id,
      input.statut,
      input.validateur_id,
      input.mode_garde,
    );
  }
}