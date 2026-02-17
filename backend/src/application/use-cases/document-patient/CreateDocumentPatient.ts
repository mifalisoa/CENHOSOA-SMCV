import { IDocumentPatientRepository } from '../../../domain/repositories/IDocumentPatientRepository';
import { DocumentPatient } from '../../../domain/entities/DocumentPatient';

export class CreateDocumentPatient {
  constructor(private documentRepository: IDocumentPatientRepository) {}

  async execute(documentData: Omit<DocumentPatient, 'id_document' | 'created_at' | 'updated_at'>): Promise<DocumentPatient> {
    // Validation métier
    if (!documentData.titre || !documentData.nom_fichier || !documentData.url_fichier) {
      throw new Error('Titre, nom de fichier et URL sont requis');
    }

    if (!['pdf', 'image', 'video'].includes(documentData.type_fichier)) {
      throw new Error('Type de fichier invalide. Utilisez: pdf, image ou video');
    }

    return await this.documentRepository.create(documentData);
  }
}