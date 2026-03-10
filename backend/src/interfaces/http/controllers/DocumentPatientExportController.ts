// backend/src/interfaces/http/controllers/DocumentPatientExportController.ts

import { Request, Response, NextFunction } from 'express';
import { PostgresDocumentPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresDocumentPatientRepository';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { pool } from '../../../config/database';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

const documentRepo = new PostgresDocumentPatientRepository(pool);
const patientRepo = new PostgresPatientRepository(pool);

export class DocumentPatientExportController {
  // Télécharger tous les documents d'un patient en ZIP
  async downloadAllZIP(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId as string);

      // Récupérer le patient
      const patient = await patientRepo.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      // Récupérer tous les documents du patient
      const documents = await documentRepo.findByPatientId(patientId);
      
      if (documents.length === 0) {
        return res.status(404).json({ success: false, message: 'Aucun document trouvé' });
      }

      // Créer l'archive ZIP
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Configurer les headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=documents_${patient.nom_patient}_${patient.prenom_patient}.zip`
      );

      // Pipe l'archive vers la réponse
      archive.pipe(res);

      // Compteur de fichiers ajoutés
      let filesAdded = 0;

      // Ajouter chaque document dans le ZIP
      for (const doc of documents) {
        try {
          // Extraire le chemin du fichier depuis l'URL
          // URL format: http://localhost:3000/uploads/patients/10/fichier.pdf
          const urlPath = new URL(doc.url_fichier).pathname;
          const filePath = path.join(__dirname, '../../../../', urlPath);

          // Vérifier que le fichier existe
          if (fs.existsSync(filePath)) {
            // Créer un nom de fichier unique dans le ZIP
            const ext = path.extname(doc.nom_fichier);
            const baseName = path.basename(doc.nom_fichier, ext);
            const zipFileName = `${filesAdded + 1}_${baseName}${ext}`;

            // Ajouter le fichier au ZIP
            archive.file(filePath, { name: zipFileName });
            filesAdded++;
          } else {
            console.warn(`⚠️ Fichier non trouvé: ${filePath}`);
          }
        } catch (error) {
          console.error(`❌ Erreur ajout fichier ${doc.nom_fichier}:`, error);
        }
      }

      // Vérifier qu'au moins un fichier a été ajouté
      if (filesAdded === 0) {
        archive.abort();
        return res.status(404).json({ 
          success: false, 
          message: 'Aucun fichier accessible pour le téléchargement' 
        });
      }

      console.log(`✅ ZIP généré avec ${filesAdded} fichier(s)`);

      // Finaliser l'archive
      await archive.finalize();
    } catch (error) {
      console.error('❌ Erreur génération ZIP:', error);
      next(error);
    }
  }
}