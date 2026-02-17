import { ICompteRenduRepository } from '../../../domain/repositories/ICompteRenduRepository';
import { CompteRendu } from '../../../domain/entities/CompteRendu';

export class CreateCompteRendu {
  constructor(private compteRenduRepository: ICompteRenduRepository) {}

  async execute(compteRenduData: Omit<CompteRendu, 'id_compte_rendu' | 'created_at' | 'updated_at'>): Promise<CompteRendu> {
    // Validation métier
    if (!compteRenduData.id_admission) {
      throw new Error('L\'ID d\'admission est requis pour créer un compte rendu');
    }

    if (!compteRenduData.resume_observation || !compteRenduData.diagnostic_sortie || !compteRenduData.traitement_sortie) {
      throw new Error('Résumé, diagnostic et traitement de sortie sont requis');
    }

    if (!compteRenduData.medecin) {
      throw new Error('Le médecin est requis');
    }

    if (compteRenduData.modalite_sortie === 'transfert' && !compteRenduData.lieu_transfert) {
      throw new Error('Le lieu de transfert est requis pour une sortie en transfert');
    }

    // Vérifier qu'il n'y a pas déjà un compte rendu pour cette admission
    const existingCompteRendu = await this.compteRenduRepository.findByAdmissionId(compteRenduData.id_admission);
    if (existingCompteRendu) {
      throw new Error('Un compte rendu existe déjà pour cette admission');
    }

    return await this.compteRenduRepository.create(compteRenduData);
  }
}