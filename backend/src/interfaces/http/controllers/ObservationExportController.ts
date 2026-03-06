import { Request, Response, NextFunction } from 'express';
import { ObservationPDFService } from '../../../application/services/ObservationPDFService';
import { PostgresObservationRepository } from '../../../infrastructure/database/postgres/repositories/PostgresObservationRepository';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { pool } from '../../../config/database';
import archiver from 'archiver';

const observationRepo = new PostgresObservationRepository(pool);
const patientRepo = new PostgresPatientRepository(pool);
const pdfService = new ObservationPDFService();

export class ObservationExportController {
  // Télécharger une observation en PDF
  async downloadPDF(req: Request, res: Response, next: NextFunction) {
    try {
      // Correction TS2345: on force la conversion en string avant parseInt
      const id = parseInt(req.params.id as string);
      
      const observation = await observationRepo.findById(id);
      if (!observation) {
        return res.status(404).json({ success: false, message: 'Observation non trouvée' });
      }

      const patient = await patientRepo.findById(observation.id_patient);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      const pdfDoc = pdfService.generatePDF(observation, patient);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=observation_${id}_${patient.nom_patient}.pdf`
      );

      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      next(error);
    }
  }

  // Télécharger toutes les observations d'un patient en ZIP
  async downloadAllZIP(req: Request, res: Response, next: NextFunction) {
    try {
      // Correction TS2345: cast as string
      const patientId = parseInt(req.params.patientId as string);

      const patient = await patientRepo.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      // Correction TS2551: Utilisation du bon nom de méthode 'findByPatientId'
      const observations = await observationRepo.findByPatientId(patientId);
      
      if (observations.length === 0) {
        return res.status(404).json({ success: false, message: 'Aucune observation trouvée' });
      }

      const archive = archiver('zip', { zlib: { level: 9 } });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=observations_${patient.nom_patient}_${patient.prenom_patient}.zip`
      );

      archive.pipe(res);

      for (const [index, observation] of observations.entries()) {
        const pdfDoc = pdfService.generatePDF(observation, patient);
        const pdfBuffer: Buffer[] = [];

        await new Promise<void>((resolve, reject) => {
          pdfDoc.on('data', (chunk) => pdfBuffer.push(chunk));
          pdfDoc.on('end', () => resolve());
          pdfDoc.on('error', reject);
          pdfDoc.end();
        });

        const fileName = `observation_${index + 1}_${new Date(observation.date_observation).toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
        archive.append(Buffer.concat(pdfBuffer), { name: fileName });
      }

      await archive.finalize();
    } catch (error) {
      console.error('Erreur génération ZIP:', error);
      next(error);
    }
  }
}