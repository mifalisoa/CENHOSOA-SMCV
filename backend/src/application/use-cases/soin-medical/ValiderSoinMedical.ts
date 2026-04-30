import { ISoinMedicalRepository } from '../../../domain/repositories/ISoinMedicalRepository';
import { SoinMedical, } from '../../../domain/entities/SoinMedical';
import { StatutValidation, ROLES_VALIDATEURS, RoleType } from '../../../shared/types';

export interface ValiderSoinMedicalInput {
  id:              number;
  statut:          StatutValidation;
  validateur_id:   number;
  validateur_role: RoleType;
  mode_garde:      boolean;
}

export class ValiderSoinMedical {
  constructor(private soinRepository: ISoinMedicalRepository) {}

  async execute(input: ValiderSoinMedicalInput): Promise<SoinMedical> {
    // ── Règle métier : seul un médecin peut valider ──────────────────────────
    if (!ROLES_VALIDATEURS.includes(input.validateur_role)) {
      throw new Error('Seul un médecin peut valider un acte médical');
    }

    // ── Vérification existence ───────────────────────────────────────────────
    const soin = await this.soinRepository.findById(input.id);
    if (!soin) {
      throw new Error('Soin médical non trouvé');
    }

    // ── Règle métier : on ne peut pas valider un acte déjà validé ou rejeté
    //    sauf en mode garde (urgence) ─────────────────────────────────────────
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