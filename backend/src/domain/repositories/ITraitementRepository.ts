import { Traitement } from '../entities/Traitement';

export interface ITraitementRepository {
  // Crée un seul traitement (usage interne / rétrocompatibilité)
  create(traitement: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at'>): Promise<Traitement>;

  // ✅ Crée plusieurs médicaments d'une même ordonnance en une transaction atomique
  // Tous partagent le même id_ordonnance généré automatiquement
  createMany(traitements: Omit<Traitement, 'id_traitement' | 'created_at' | 'updated_at'>[]): Promise<Traitement[]>;

  findById(id: number): Promise<Traitement | null>;
  findByPatientId(patientId: number): Promise<Traitement[]>;
  findByAdmissionId(admissionId: number): Promise<Traitement[]>;
  update(id: number, traitement: Partial<Traitement>): Promise<Traitement>;
  delete(id: number): Promise<void>;
}