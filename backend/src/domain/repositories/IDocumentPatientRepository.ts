import { DocumentPatient } from '../entities/DocumentPatient';

export interface IDocumentPatientRepository {
  create(document: Omit<DocumentPatient, 'id_document' | 'created_at' | 'updated_at'>): Promise<DocumentPatient>;
  findById(id: number): Promise<DocumentPatient | null>;
  findByPatientId(patientId: number): Promise<DocumentPatient[]>;
  findByAdmissionId(admissionId: number): Promise<DocumentPatient[]>;
  update(id: number, document: Partial<DocumentPatient>): Promise<DocumentPatient>;
  delete(id: number): Promise<void>;
}