import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement } from '../../../domain/entities/Traitement';

export interface AddMedicamentInput {
  id_ordonnance:       string;
  cree_par_id?:        number;
  medicament:          string;
  dosage:              string;
  voie_administration: string;
  frequence:           string;
  duree:               string;
  instructions?:       string;
}

export class AddMedicamentToOrdonnance {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(input: AddMedicamentInput): Promise<Traitement> {
    if (!input.medicament?.trim())          throw new Error('Le médicament est requis');
    if (!input.dosage?.trim())              throw new Error('Le dosage est requis');
    if (!input.voie_administration?.trim()) throw new Error('La voie d\'administration est requise');
    if (!input.frequence?.trim())           throw new Error('La fréquence est requise');
    if (!input.duree?.trim())               throw new Error('La durée est requise');

    // Recupere les infos communes depuis les medicaments existants de l'ordonnance
    const existants = await this.traitementRepository.findByOrdonnanceId(input.id_ordonnance);
    if (existants.length === 0) {
      throw new Error('Ordonnance introuvable');
    }

    const reference = existants[0];

    // Un medicament ne peut etre ajoute que si l'ordonnance est encore en attente
    if (reference.statut !== 'en_attente') {
      throw new Error('Impossible d\'ajouter un médicament à une ordonnance déjà validée ou rejetée');
    }

    return await this.traitementRepository.create({
      id_patient:             reference.id_patient,
      id_admission:           reference.id_admission,
      id_ordonnance:          reference.id_ordonnance,
      date_prescription:      reference.date_prescription,
      heure_prescription:     reference.heure_prescription,
      type_document:          reference.type_document,
      diagnostic:             reference.diagnostic,
      prescripteur:           reference.prescripteur,
      lieu_prescription:      reference.lieu_prescription,
      observations_speciales: reference.observations_speciales,
      cree_par_id:            input.cree_par_id,
      statut:                 reference.statut,   // meme statut que le reste du groupe
      medicament:             input.medicament,
      dosage:                 input.dosage,
      voie_administration:    input.voie_administration,
      frequence:              input.frequence,
      duree:                  input.duree,
      instructions:           input.instructions,
    });
  }
}
