import { CompteRenduConsultation } from '../entities/CompteRenduConsultation';

export interface ICompteRenduConsultationRepository {
  create(
    data: Omit<CompteRenduConsultation, 'id_compte_rendu_consultation' | 'created_at' | 'updated_at'>
  ): Promise<CompteRenduConsultation>;

  findById(id: number): Promise<CompteRenduConsultation | null>;
  findByPatientId(patientId: number): Promise<CompteRenduConsultation[]>;

  update(id: number, data: Partial<CompteRenduConsultation>): Promise<CompteRenduConsultation>;
  delete(id: number): Promise<void>;
}