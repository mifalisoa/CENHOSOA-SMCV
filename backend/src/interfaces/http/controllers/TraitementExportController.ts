// backend/src/interfaces/http/controllers/TraitementExportController.ts

import { Request, Response, NextFunction } from 'express';
import { TraitementPDFService } from '../../../application/services/TraitementPDFService';
import { PostgresTraitementRepository } from '../../../infrastructure/database/postgres/repositories/PostgresTraitementRepository';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { pool } from '../../../config/database';
import archiver from 'archiver';

const traitementRepo = new PostgresTraitementRepository(pool);
const patientRepo = new PostgresPatientRepository(pool);
const pdfService = new TraitementPDFService();

export class TraitementExportController {
  // Télécharger un traitement en PDF
  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      
      // Récupérer le traitement
      const traitement = await traitementRepo.findById(id);
      if (!traitement) {
        return res.status(404).json({ success: false, message: 'Traitement non trouvé' });
      }

      // Récupérer le patient
      const patient = await patientRepo.findById(traitement.id_patient);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      // Générer le PDF
      const pdfDoc = pdfService.generatePDF(traitement, patient);

      // Configurer les headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${traitement.type_document}_${id}_${patient.nom_patient}.pdf`
      );

      // Envoyer le PDF
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      next(error);
    }
  }

  // Télécharger tous les traitements d'un patient en ZIP
  async downloadAllZIP(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId as string);

      // Récupérer le patient
      const patient = await patientRepo.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      // Récupérer tous les traitements du patient
      const traitements = await traitementRepo.findByPatientId(patientId);
      
      if (traitements.length === 0) {
        return res.status(404).json({ success: false, message: 'Aucun traitement trouvé' });
      }

      // Créer l'archive ZIP
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Configurer les headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=traitements_${patient.nom_patient}_${patient.prenom_patient}.zip`
      );

      // Pipe l'archive vers la réponse
      archive.pipe(res);

      // Ajouter chaque traitement comme PDF dans le ZIP
      for (const [index, traitement] of traitements.entries()) {
        const pdfDoc = pdfService.generatePDF(traitement, patient);
        const pdfBuffer: Buffer[] = [];

        // Collecter le PDF en buffer
        await new Promise<void>((resolve, reject) => {
          pdfDoc.on('data', (chunk) => pdfBuffer.push(chunk));
          pdfDoc.on('end', () => resolve());
          pdfDoc.on('error', reject);
          pdfDoc.end();
        });

        // Ajouter au ZIP
        const fileName = `${traitement.type_document}_${index + 1}_${traitement.medicament.replace(/\s+/g, '_')}.pdf`;
        archive.append(Buffer.concat(pdfBuffer), { name: fileName });
      }

      // Finaliser l'archive
      await archive.finalize();
    } catch (error) {
      console.error('Erreur génération ZIP:', error);
      next(error);
    }
  }
}