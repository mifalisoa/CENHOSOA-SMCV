import type { DocumentPatient, CreateDocumentPatientDTO } from '../entities/DocumentPatient';

export interface IDocumentPatientRepository {
  create(data: CreateDocumentPatientDTO): Promise<DocumentPatient>;
  getByPatientId(patientId: number): Promise<DocumentPatient[]>;
  getByAdmissionId(admissionId: number): Promise<DocumentPatient[]>;
  getById(id: number): Promise<DocumentPatient>;
  update(id: number, data: Partial<CreateDocumentPatientDTO>): Promise<DocumentPatient>;
  delete(id: number): Promise<void>;
}