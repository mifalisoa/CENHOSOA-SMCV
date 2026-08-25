import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement, CreateOrdonnanceDTO } from '../../../domain/entities/Traitement';
import { ROLES_NECESSITANT_VALIDATION, RoleType } from '../../../shared/types';

// Etend le DTO existant avec les infos de tracabilite
export interface CreateOrdonnanceDTOWithRole extends CreateOrdonnanceDTO {
  role_createur?: RoleType;
}

export class CreateManyTraitements {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(data: CreateOrdonnanceDTOWithRole): Promise<Traitement[]> {
    // Validation metier
    if (!data.medicaments || data.medicaments.length === 0) {
      throw new Error('Au moins un médicament est requis');
    }

    for (let i = 0; i < data.medicaments.length; i++) {
      const med = data.medicaments[i];
      const num = i + 1;
      if (!med.medicament?.trim())          throw new Error(`Médicament #${num} : le nom est requis`);
      if (!med.dosage?.trim())              throw new Error(`Médicament #${num} : le dosage est requis`);
      if (!med.voie_administration?.trim()) throw new Error(`Médicament #${num} : la voie d'administration est requise`);
      if (!med.frequence?.trim())           throw new Error(`Médicament #${num} : la fréquence est requise`);
      if (!med.duree?.trim())               throw new Error(`Médicament #${num} : la durée est requise`);
    }

    // Regle metier : statut selon le role du createur
    // Medecin/admin cree une ordonnance deja validee, interne/stagiaire en attente
    const necessiteValidation =
      data.role_createur !== undefined &&
      ROLES_NECESSITANT_VALIDATION.includes(data.role_createur);

    const statutInitial = necessiteValidation ? 'en_attente' : 'valide';

    type TraitementCreate = Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at' | 'valide_par' | 'valide_le' | 'valideur_nom' | 'valideur_prenom' | 'mode_garde'>;

    const traitements: TraitementCreate[] = data.medicaments.map(med => ({
      id_patient:             data.id_patient,
      id_admission:           data.id_admission,
      date_prescription:      new Date(data.date_prescription),
      heure_prescription:     data.heure_prescription,
      type_document:          data.type_document,
      diagnostic:             data.diagnostic,
      prescripteur:           data.prescripteur,
      lieu_prescription:      data.lieu_prescription,
      observations_speciales: data.observations_speciales,
      cree_par_id:            data.cree_par_id,
      statut:                 statutInitial,
      medicament:             med.medicament,
      dosage:                 med.dosage,
      voie_administration:    med.voie_administration,
      frequence:              med.frequence,
      duree:                  med.duree,
      instructions:           med.instructions,
    }));

    return await this.traitementRepository.createMany(traitements);
  }
}