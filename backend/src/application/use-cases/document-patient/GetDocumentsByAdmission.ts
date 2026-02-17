import { IDocumentPatientRepository } from '../../../domain/repositories/IDocumentPatientRepository';
import { DocumentPatient } from '../../../domain/entities/DocumentPatient';

export class GetDocumentsByAdmission {
  constructor(private documentRepository: IDocumentPatientRepository) {}

  async execute(admissionId: number): Promise<DocumentPatient[]> {
    return await this.documentRepository.findByAdmissionId(admissionId);
  }
}