import { Request, Response, NextFunction } from 'express';
import { BilanBiologiquePDFService } from '../../../application/services/BilanBiologiquePDFService';
import { PostgresBilanBiologiqueRepository } from '../../../infrastructure/database/postgres/repositories/PostgresBilanBiologiqueRepository';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { pool } from '../../../config/database';
import archiver from 'archiver';

const bilanRepo = new PostgresBilanBiologiqueRepository(pool);
const patientRepo = new PostgresPatientRepository(pool);
const pdfService = new BilanBiologiquePDFService();

export class BilanBiologiqueExportController {
  // Télécharger un bilan en PDF
  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      // ✅ Correction : Cast en string pour parseInt
      const id = parseInt(req.params.id as string);
      
      const bilan = await bilanRepo.findById(id);
      if (!bilan) {
        return res.status(404).json({ success: false, message: 'Bilan non trouvé' });
      }

      const patient = await patientRepo.findById(bilan.id_patient);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      const pdfDoc = pdfService.generatePDF(bilan, patient);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bilan_${id}_${patient.nom_patient}.pdf`
      );

      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      next(error);
    }
  }

  // Télécharger tous les bilans d'un patient en ZIP
  async downloadAllZIP(req: Request, res: Response, next: NextFunction) {
    try {
      // ✅ Correction : Cast en string
      const patientId = parseInt(req.params.patientId as string);

      const patient = await patientRepo.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      // ✅ Correction : Utilisation du bon nom de méthode (findByPatientId)
      const bilans = await bilanRepo.findByPatientId(patientId);
      
      if (bilans.length === 0) {
        return res.status(404).json({ success: false, message: 'Aucun bilan trouvé' });
      }

      const archive = archiver('zip', { zlib: { level: 9 } });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bilans_${patient.nom_patient}_${patient.prenom_patient}.zip`
      );

      archive.pipe(res);

      for (const [index, bilan] of bilans.entries()) {
        const pdfDoc = pdfService.generatePDF(bilan, patient);
        const pdfBuffer: Buffer[] = [];

        await new Promise<void>((resolve, reject) => {
          pdfDoc.on('data', (chunk) => pdfBuffer.push(chunk));
          pdfDoc.on('end', () => resolve());
          pdfDoc.on('error', reject);
          pdfDoc.end();
        });

        // ✅ Formatage sécurisé de la date pour le nom de fichier
        const dateFormatted = bilan.date_prelevement 
          ? new Date(bilan.date_prelevement).toLocaleDateString('fr-FR').replace(/\//g, '-')
          : `inconnue-${index}`;

        const fileName = `bilan_${index + 1}_${dateFormatted}.pdf`;
        archive.append(Buffer.concat(pdfBuffer), { name: fileName });
      }

      await archive.finalize();
    } catch (error) {
      console.error('Erreur génération ZIP:', error);
      next(error);
    }
  }
}