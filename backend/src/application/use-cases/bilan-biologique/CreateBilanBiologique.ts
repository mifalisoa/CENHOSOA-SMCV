import { IBilanBiologiqueRepository } from '../../../domain/repositories/IBilanBiologiqueRepository';
import { BilanBiologique } from '../../../domain/entities/BilanBiologique';

export class CreateBilanBiologique {
  constructor(private bilanRepository: IBilanBiologiqueRepository) {}

  async execute(bilanData: Omit<BilanBiologique, 'id_bilan' | 'created_at' | 'updated_at'>): Promise<BilanBiologique> {
    // Validation métier
    if (!bilanData.date_prelevement) {
      throw new Error('La date de prélèvement est requise');
    }

    return await this.bilanRepository.create(bilanData);
  }
}