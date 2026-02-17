import { ISoinMedicalRepository } from '../../../domain/repositories/ISoinMedicalRepository';
import { SoinMedical } from '../../../domain/entities/SoinMedical';

export class CreateSoinMedical {
  constructor(private soinRepository: ISoinMedicalRepository) {}

  async execute(soinData: Omit<SoinMedical, 'id_soin_medical' | 'created_at' | 'updated_at'>): Promise<SoinMedical> {
    // Validation métier
    if (!soinData.realise_par) {
      throw new Error('Le médecin réalisateur est requis');
    }

    if (!soinData.ett && !soinData.eto && !soinData.autre) {
      throw new Error('Au moins un type de soin doit être renseigné');
    }

    return await this.soinRepository.create(soinData);
  }
}