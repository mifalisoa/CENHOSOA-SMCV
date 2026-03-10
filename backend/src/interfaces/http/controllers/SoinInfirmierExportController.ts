// backend/src/interfaces/http/controllers/SoinInfirmierExportController.ts

import { Request, Response, NextFunction } from 'express';
import { SoinInfirmierPDFService } from '../../../application/services/SoininfirmierPDFservice';
import { PostgresSoinInfirmierRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinInfirmierRepository';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { pool } from '../../../config/database';
import archiver from 'archiver';

const soinRepo = new PostgresSoinInfirmierRepository(pool);
const patientRepo = new PostgresPatientRepository(pool);
const pdfService = new SoinInfirmierPDFService();

export class SoinInfirmierExportController {
  // Télécharger un soin en PDF
  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      
      // Récupérer le soin
      const soin = await soinRepo.findById(id);
      if (!soin) {
        return res.status(404).json({ success: false, message: 'Soin non trouvé' });
      }

      // Récupérer le patient
      const patient = await patientRepo.findById(soin.id_patient);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      // Générer le PDF
      const pdfDoc = pdfService.generatePDF(soin, patient);

      // Configurer les headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=soin_infirmier_${id}_${patient.nom_patient}.pdf`
      );

      // Envoyer le PDF
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      next(error);
    }
  }

  // Télécharger tous les soins d'un patient en ZIP
  async downloadAllZIP(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId as string);

      // Récupérer le patient
      const patient = await patientRepo.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      // Récupérer tous les soins du patient
      const soins = await soinRepo.findByPatientId(patientId);
      
      if (soins.length === 0) {
        return res.status(404).json({ success: false, message: 'Aucun soin trouvé' });
      }

      // Créer l'archive ZIP
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Configurer les headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=soins_infirmiers_${patient.nom_patient}_${patient.prenom_patient}.zip`
      );

      // Pipe l'archive vers la réponse
      archive.pipe(res);

      // Ajouter chaque soin comme PDF dans le ZIP
      for (const [index, soin] of soins.entries()) {
        const pdfDoc = pdfService.generatePDF(soin, patient);
        const pdfBuffer: Buffer[] = [];

        // Collecter le PDF en buffer
        await new Promise<void>((resolve, reject) => {
          pdfDoc.on('data', (chunk) => pdfBuffer.push(chunk));
          pdfDoc.on('end', () => resolve());
          pdfDoc.on('error', reject);
          pdfDoc.end();
        });

        // Ajouter au ZIP
        const fileName = `soin_infirmier_${index + 1}_${new Date(soin.date_soin).toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
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