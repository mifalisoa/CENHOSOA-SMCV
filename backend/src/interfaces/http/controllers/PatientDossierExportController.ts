// backend/src/interfaces/http/controllers/PatientDossierExportController.ts

import { Request, Response, NextFunction } from 'express';
import { PostgresPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresPatientRepository';
import { PostgresObservationRepository } from '../../../infrastructure/database/postgres/repositories/PostgresObservationRepository';
import { PostgresBilanBiologiqueRepository } from '../../../infrastructure/database/postgres/repositories/PostgresBilanBiologiqueRepository';
import { PostgresSoinMedicalRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinMedicalRepository';
import { PostgresSoinInfirmierRepository } from '../../../infrastructure/database/postgres/repositories/PostgresSoinInfirmierRepository';
import { PostgresTraitementRepository } from '../../../infrastructure/database/postgres/repositories/PostgresTraitementRepository';
import { PostgresDocumentPatientRepository } from '../../../infrastructure/database/postgres/repositories/PostgresDocumentPatientRepository';
import { ObservationPDFService } from '../../../application/services/ObservationPDFService';
import { BilanBiologiquePDFService } from '../../../application/services/BilanBiologiquePDFService';
import { SoinMedicalPDFService } from '../../../application/services/SoinMedicalPDFService';
import { SoinInfirmierPDFService } from '../../../application/services/SoinInfirmierPDFService';
import { TraitementPDFService } from '../../../application/services/TraitementPDFService';
import { pool } from '../../../config/database';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';

const patientRepo = new PostgresPatientRepository(pool);
const observationRepo = new PostgresObservationRepository(pool);
const bilanRepo = new PostgresBilanBiologiqueRepository(pool);
const soinMedicalRepo = new PostgresSoinMedicalRepository(pool);
const soinInfirmierRepo = new PostgresSoinInfirmierRepository(pool);
const traitementRepo = new PostgresTraitementRepository(pool);
const documentRepo = new PostgresDocumentPatientRepository(pool);

const observationPDFService = new ObservationPDFService();
const bilanPDFService = new BilanBiologiquePDFService();
const soinMedicalPDFService = new SoinMedicalPDFService();
const soinInfirmierPDFService = new SoinInfirmierPDFService();
const traitementPDFService = new TraitementPDFService();

export class PatientDossierExportController {
  /**
   * Télécharger TOUT le dossier patient en ZIP
   * Contient : Observations, Bilans, Soins médicaux, Soins infirmiers, Traitements, Documents
   */
  async downloadDossierComplet(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = parseInt(req.params.patientId as string);

      // Récupérer le patient
      const patient = await patientRepo.findById(patientId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient non trouvé' });
      }

      console.log(`📦 Génération ZIP complet pour patient ${patient.nom_patient} ${patient.prenom_patient}`);

      // Créer l'archive ZIP
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Configurer les headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=dossier_complet_${patient.nom_patient}_${patient.prenom_patient}.zip`
      );

      // Pipe l'archive vers la réponse
      archive.pipe(res);

      let totalFiles = 0;

      // ==========================================
      // 1. OBSERVATIONS MÉDICALES
      // ==========================================
      try {
        const observations = await observationRepo.findByPatientId(patientId);
        console.log(`📋 ${observations.length} observation(s) trouvée(s)`);

        for (let i = 0; i < observations.length; i++) {
          const obs = observations[i];
          const pdfDoc = await observationPDFService.generatePDF(obs, patient);
          
          // Convertir PDFDocument en Buffer
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
          });
          
          const dateStr = obs.date_observation instanceof Date 
            ? obs.date_observation.toISOString().split('T')[0]
            : String(obs.date_observation).split('T')[0];
          
          archive.append(pdfBuffer, { 
            name: `1_Observations/${i + 1}_observation_${dateStr}.pdf` 
          });
          totalFiles++;
        }
      } catch (error) {
        console.error('⚠️ Erreur observations:', error);
      }

      // ==========================================
      // 2. BILANS BIOLOGIQUES
      // ==========================================
      try {
        const bilans = await bilanRepo.findByPatientId(patientId);
        console.log(`🧪 ${bilans.length} bilan(s) trouvé(s)`);

        for (let i = 0; i < bilans.length; i++) {
          const bilan = bilans[i];
          const pdfDoc = await bilanPDFService.generatePDF(bilan, patient);
          
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
          });
          
          const dateStr = bilan.date_prelevement instanceof Date 
            ? bilan.date_prelevement.toISOString().split('T')[0]
            : String(bilan.date_prelevement).split('T')[0];
          
          archive.append(pdfBuffer, { 
            name: `2_Bilans_Biologiques/${i + 1}_bilan_${dateStr}.pdf` 
          });
          totalFiles++;
        }
      } catch (error) {
        console.error('⚠️ Erreur bilans:', error);
      }

      // ==========================================
      // 3. SOINS MÉDICAUX
      // ==========================================
      try {
        const soinsMedicaux = await soinMedicalRepo.findByPatientId(patientId);
        console.log(`💉 ${soinsMedicaux.length} soin(s) médical/aux trouvé(s)`);

        for (let i = 0; i < soinsMedicaux.length; i++) {
          const soin = soinsMedicaux[i];
          const pdfDoc = await soinMedicalPDFService.generatePDF(soin, patient);
          
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
          });
          
          const dateStr = soin.date_soin instanceof Date 
            ? soin.date_soin.toISOString().split('T')[0]
            : String(soin.date_soin).split('T')[0];
          
          archive.append(pdfBuffer, { 
            name: `3_Soins_Medicaux/${i + 1}_soin_medical_${dateStr}.pdf` 
          });
          totalFiles++;
        }
      } catch (error) {
        console.error('⚠️ Erreur soins médicaux:', error);
      }

      // ==========================================
      // 4. SOINS INFIRMIERS
      // ==========================================
      try {
        const soinsInfirmiers = await soinInfirmierRepo.findByPatientId(patientId);
        console.log(`💊 ${soinsInfirmiers.length} soin(s) infirmier(s) trouvé(s)`);

        for (let i = 0; i < soinsInfirmiers.length; i++) {
          const soin = soinsInfirmiers[i];
          const pdfDoc = await soinInfirmierPDFService.generatePDF(soin, patient);
          
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
          });
          
          const dateStr = soin.date_soin instanceof Date 
            ? soin.date_soin.toISOString().split('T')[0]
            : String(soin.date_soin).split('T')[0];
          
          archive.append(pdfBuffer, { 
            name: `4_Soins_Infirmiers/${i + 1}_soin_infirmier_${dateStr}.pdf` 
          });
          totalFiles++;
        }
      } catch (error) {
        console.error('⚠️ Erreur soins infirmiers:', error);
      }

      // ==========================================
      // 5. TRAITEMENTS
      // ==========================================
      try {
        const traitements = await traitementRepo.findByPatientId(patientId);
        console.log(`💊 ${traitements.length} traitement(s) trouvé(s)`);

        for (let i = 0; i < traitements.length; i++) {
          const traitement = traitements[i];
          const pdfDoc = await traitementPDFService.generatePDF(traitement, patient);
          
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
          });
          
          const dateStr = traitement.date_prescription instanceof Date 
            ? traitement.date_prescription.toISOString().split('T')[0]
            : String(traitement.date_prescription).split('T')[0];
          
          archive.append(pdfBuffer, { 
            name: `5_Traitements/${i + 1}_traitement_${dateStr}.pdf` 
          });
          totalFiles++;
        }
      } catch (error) {
        console.error('⚠️ Erreur traitements:', error);
      }

      // ==========================================
      // 6. DOCUMENTS PATIENTS (fichiers uploadés)
      // ==========================================
      try {
        const documents = await documentRepo.findByPatientId(patientId);
        console.log(`📄 ${documents.length} document(s) trouvé(s)`);

        for (let i = 0; i < documents.length; i++) {
          const doc = documents[i];
          try {
            // Extraire le chemin du fichier depuis l'URL
            const urlPath = new URL(doc.url_fichier).pathname;
            const filePath = path.join(__dirname, '../../../../', urlPath);

            // Vérifier que le fichier existe
            if (fs.existsSync(filePath)) {
              const ext = path.extname(doc.nom_fichier);
              const baseName = path.basename(doc.nom_fichier, ext);
              const fileName = `${i + 1}_${baseName}${ext}`;

              archive.file(filePath, { name: `6_Documents/${fileName}` });
              totalFiles++;
            } else {
              console.warn(`⚠️ Fichier non trouvé: ${filePath}`);
            }
          } catch (error) {
            console.error(`❌ Erreur ajout document ${doc.nom_fichier}:`, error);
          }
        }
      } catch (error) {
        console.error('⚠️ Erreur documents:', error);
      }

      // Vérifier qu'au moins un fichier a été ajouté
      if (totalFiles === 0) {
        archive.abort();
        return res.status(404).json({ 
          success: false, 
          message: 'Aucune donnée disponible dans le dossier patient' 
        });
      }

      console.log(`✅ ZIP complet généré avec ${totalFiles} fichier(s)`);

      // Finaliser l'archive
      await archive.finalize();
    } catch (error) {
      console.error('❌ Erreur génération ZIP complet:', error);
      next(error);
    }
  }
}