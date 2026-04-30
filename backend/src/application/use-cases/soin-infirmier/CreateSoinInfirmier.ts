import { ISoinInfirmierRepository } from '../../../domain/repositories/ISoinInfirmierRepository';
import { SoinInfirmier } from '../../../domain/entities/SoinInfirmier';
import { ROLES_NECESSITANT_VALIDATION, RoleType } from '../../../shared/types';

export interface CreateSoinInfirmierInput {
  id_patient:    number;
  id_admission?: number;
  date_soin:     Date;
  heure_soin:    string;
  ecg?:          string;
  ecg_dii_long?: string;
  injection_iv?: string;
  injection_im?: string;
  pse?:          string;
  pansement?:    string;
  autre_soins?:  string;
  realise_par:   string;
  cree_par_id?:  number;
  role_createur?: RoleType;
}

export class CreateSoinInfirmier {
  constructor(private soinRepository: ISoinInfirmierRepository) {}

  async execute(input: CreateSoinInfirmierInput): Promise<SoinInfirmier> {
    // ── Validation métier ────────────────────────────────────────────────────
    if (!input.realise_par) {
      throw new Error('L\'infirmier réalisateur est requis');
    }

    if (
      !input.ecg && !input.ecg_dii_long && !input.injection_iv &&
      !input.injection_im && !input.pse && !input.pansement && !input.autre_soins
    ) {
      throw new Error('Au moins un type de soin doit être renseigné');
    }

    // ── Règle métier : statut selon le rôle du créateur ─────────────────────
    const necessiteValidation =
      input.role_createur !== undefined &&
      ROLES_NECESSITANT_VALIDATION.includes(input.role_createur);

    return await this.soinRepository.create({
      id_patient:   input.id_patient,
      id_admission: input.id_admission,
      date_soin:    input.date_soin,
      heure_soin:   input.heure_soin,
      ecg:          input.ecg,
      ecg_dii_long: input.ecg_dii_long,
      injection_iv: input.injection_iv,
      injection_im: input.injection_im,
      pse:          input.pse,
      pansement:    input.pansement,
      autre_soins:  input.autre_soins,
      realise_par:  input.realise_par,
      cree_par_id:  input.cree_par_id,
      verifie:      !necessiteValidation,
    });
  }
}