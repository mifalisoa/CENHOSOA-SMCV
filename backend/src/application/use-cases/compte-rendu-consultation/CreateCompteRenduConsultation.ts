import { ICompteRenduConsultationRepository } from '../../../domain/repositories/ICompteRenduConsultationRepository';
import { CompteRenduConsultation } from '../../../domain/entities/CompteRenduConsultation';

export class CreateCompteRenduConsultation {
  constructor(private repository: ICompteRenduConsultationRepository) {}

  async execute(
    data: Omit<CompteRenduConsultation, 'id_compte_rendu_consultation' | 'created_at' | 'updated_at'>
  ): Promise<CompteRenduConsultation> {
    // Validation métier
    if (!data.id_patient) {
      throw new Error("L'ID du patient est requis pour créer un compte rendu de consultation");
    }

    if (!data.motif_consultation || !data.diagnostic || !data.traitement) {
      throw new Error('Motif de consultation, diagnostic et traitement sont requis');
    }

    if (!data.medecin) {
      throw new Error('Le médecin est requis');
    }

    // Contrairement au compte rendu d'hospitalisation, un patient externe peut avoir
    // plusieurs consultations dans le temps — aucune contrainte d'unicité ici.
    return await this.repository.create(data);
  }
}