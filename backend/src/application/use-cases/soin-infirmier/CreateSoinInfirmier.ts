import { ISoinInfirmierRepository } from '../../../domain/repositories/ISoinInfirmierRepository';
import { SoinInfirmier } from '../../../domain/entities/SoinInfirmier';

export class CreateSoinInfirmier {
  constructor(private soinRepository: ISoinInfirmierRepository) {}

  async execute(soinData: Omit<SoinInfirmier, 'id_soin_infirmier' | 'created_at' | 'updated_at'>): Promise<SoinInfirmier> {
    // Validation métier
    if (!soinData.realise_par) {
      throw new Error('L\'infirmier réalisateur est requis');
    }

    if (!soinData.ecg && !soinData.ecg_dii_long && !soinData.injection_iv && 
        !soinData.injection_im && !soinData.pse && !soinData.pansement && !soinData.autre_soins) {
      throw new Error('Au moins un type de soin doit être renseigné');
    }

    return await this.soinRepository.create(soinData);
  }
}