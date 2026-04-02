import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement, CreateOrdonnanceDTO } from '../../../domain/entities/Traitement';

export class CreateManyTraitements {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(data: CreateOrdonnanceDTO): Promise<Traitement[]> {
    // ── Validation métier ─────────────────────────────────────────────────────
    if (!data.medicaments || data.medicaments.length === 0) {
      throw new Error('Au moins un médicament est requis');
    }

    // Vérifie chaque médicament individuellement
    for (let i = 0; i < data.medicaments.length; i++) {
      const med = data.medicaments[i];
      const num = i + 1;

      if (!med.medicament?.trim())
        throw new Error(`Médicament #${num} : le nom est requis`);
      if (!med.dosage?.trim())
        throw new Error(`Médicament #${num} : le dosage est requis`);
      if (!med.voie_administration?.trim())
        throw new Error(`Médicament #${num} : la voie d'administration est requise`);
      if (!med.frequence?.trim())
        throw new Error(`Médicament #${num} : la fréquence est requise`);
      if (!med.duree?.trim())
        throw new Error(`Médicament #${num} : la durée est requise`);
    }

    // ── Construction des objets à insérer ─────────────────────────────────────
    // Les infos communes (date, prescripteur, diagnostic...) sont dupliquées
    // sur chaque ligne — c'est voulu, cohérent avec le schéma existant
    const traitements: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at'>[] =
      data.medicaments.map(med => ({
        id_patient:           data.id_patient,
        id_admission:         data.id_admission,
        date_prescription:    new Date(data.date_prescription),
        heure_prescription:   data.heure_prescription,
        type_document:        data.type_document,
        diagnostic:           data.diagnostic,
        prescripteur:         data.prescripteur,
        lieu_prescription:    data.lieu_prescription,
        observations_speciales: data.observations_speciales,
        // Spécifique au médicament
        medicament:           med.medicament,
        dosage:               med.dosage,
        voie_administration:  med.voie_administration,
        frequence:            med.frequence,
        duree:                med.duree,
        instructions:         med.instructions,
      }));

    return await this.traitementRepository.createMany(traitements);
  }
}