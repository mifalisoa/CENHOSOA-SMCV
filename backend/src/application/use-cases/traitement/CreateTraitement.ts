import { ITraitementRepository } from '../../../domain/repositories/ITraitementRepository';
import { Traitement } from '../../../domain/entities/Traitement';

export class CreateTraitement {
  constructor(private traitementRepository: ITraitementRepository) {}

  async execute(traitementData: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at'>): Promise<Traitement> {
    // Validation métier
    if (!traitementData.medicament) {
      throw new Error('Le médicament est requis');
    }

    if (!traitementData.dosage || !traitementData.voie_administration || 
        !traitementData.frequence || !traitementData.duree) {
      throw new Error('Dosage, voie d\'administration, fréquence et durée sont requis');
    }

    if (traitementData.type_document === 'ordonnance' && !traitementData.prescripteur) {
      throw new Error('Le prescripteur est requis pour une ordonnance');
    }

    return await this.traitementRepository.create(traitementData);
  }
}