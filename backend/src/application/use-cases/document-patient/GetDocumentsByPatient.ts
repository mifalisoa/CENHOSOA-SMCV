import { IDocumentPatientRepository } from '../../../domain/repositories/IDocumentPatientRepository';
import { DocumentPatient } from '../../../domain/entities/DocumentPatient';

export class GetDocumentsByPatient {
  constructor(private documentRepository: IDocumentPatientRepository) {}

  async execute(patientId: number): Promise<DocumentPatient[]> {
    return await this.documentRepository.findByPatientId(patientId);
  }
}