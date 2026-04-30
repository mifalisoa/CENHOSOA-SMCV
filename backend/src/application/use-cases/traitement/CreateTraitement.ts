import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement } from '../../../domain/entities/Traitement';
import { ROLES_NECESSITANT_VALIDATION, RoleType } from '../../../shared/types';

export interface CreateTraitementInput {
  id_patient:             number;
  id_admission?:          number;
  id_ordonnance?:         string;
  date_prescription:      Date;
  heure_prescription:     string;
  type_document:          'ordonnance' | 'traitement';
  diagnostic?:            string;
  prescripteur?:          string;
  lieu_prescription?:     string;
  medicament:             string;
  dosage:                 string;
  voie_administration:    string;
  frequence:              string;
  duree:                  string;
  instructions?:          string;
  observations_speciales?: string;
  cree_par_id?:           number;
  role_createur?:         RoleType;
}

export class CreateTraitement {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(input: CreateTraitementInput): Promise<Traitement> {
    // ── Validation métier ────────────────────────────────────────────────────
    if (!input.medicament) {
      throw new Error('Le médicament est requis');
    }

    if (!input.dosage || !input.voie_administration || !input.frequence || !input.duree) {
      throw new Error('Dosage, voie d\'administration, fréquence et durée sont requis');
    }

    if (input.type_document === 'ordonnance' && !input.prescripteur) {
      throw new Error('Le prescripteur est requis pour une ordonnance');
    }

    // ── Règle métier : statut selon le rôle du créateur ─────────────────────
    const necessiteValidation =
      input.role_createur !== undefined &&
      ROLES_NECESSITANT_VALIDATION.includes(input.role_createur);

    return await this.traitementRepository.create({
      id_patient:             input.id_patient,
      id_admission:           input.id_admission,
      id_ordonnance:          input.id_ordonnance,
      date_prescription:      input.date_prescription,
      heure_prescription:     input.heure_prescription,
      type_document:          input.type_document,
      diagnostic:             input.diagnostic,
      prescripteur:           input.prescripteur,
      lieu_prescription:      input.lieu_prescription,
      medicament:             input.medicament,
      dosage:                 input.dosage,
      voie_administration:    input.voie_administration,
      frequence:              input.frequence,
      duree:                  input.duree,
      instructions:           input.instructions,
      observations_speciales: input.observations_speciales,
      cree_par_id:            input.cree_par_id,

    });
  }
}