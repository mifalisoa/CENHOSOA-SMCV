import { ISoinMedicalRepository } from '../../../domain/repositories/ISoinMedicalRepository';
import { SoinMedical } from '../../../domain/entities/SoinMedical';
import { ROLES_NECESSITANT_VALIDATION, RoleType } from '../../../shared/types';

// DTO propre — le controller passe ces données, le use case gère le reste
export interface CreateSoinMedicalInput {
  id_patient:    number;
  id_admission?: number;
  date_soin:     Date;
  heure_soin:    string;
  ett?:          string;
  eto?:          string;
  autre?:        string;
  realise_par:   string;
  cree_par_id?:  number;
  role_createur?: RoleType; // détermine si validation requise
}

export class CreateSoinMedical {
  constructor(private soinRepository: ISoinMedicalRepository) {}

  async execute(input: CreateSoinMedicalInput): Promise<SoinMedical> {
    // ── Validation métier ────────────────────────────────────────────────────
    if (!input.realise_par) {
      throw new Error('Le médecin réalisateur est requis');
    }

    if (!input.ett && !input.eto && !input.autre) {
      throw new Error('Au moins un type de soin doit être renseigné');
    }

    // ── Règle métier : statut selon le rôle du créateur ─────────────────────
    // Internes et stagiaires → en_attente (validation requise)
    // Médecins              → valide directement
    const necessiteValidation =
      input.role_createur !== undefined &&
      ROLES_NECESSITANT_VALIDATION.includes(input.role_createur);

    return await this.soinRepository.create({
      id_patient:   input.id_patient,
      id_admission: input.id_admission,
      date_soin:    input.date_soin,
      heure_soin:   input.heure_soin,
      ett:          input.ett,
      eto:          input.eto,
      autre:        input.autre,
      realise_par:  input.realise_par,
      cree_par_id:  input.cree_par_id,
      verifie:      !necessiteValidation,
    });
  }
}