// backend/src/interfaces/http/routes/documentPatientUploadRoutes.ts

import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * Configuration du stockage disque
 */
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Note: id_patient doit être envoyé AVANT le fichier dans le FormData côté client
    const patientId = req.body.id_patient || 'unknown';
    const uploadDir = path.join(__dirname, `../../../../uploads/patients/${patientId}`);
    
    // Créer le dossier récursivement s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

/**
 * Filtre de fichiers et limites
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'video/mp4',
      'video/avi'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Seuls PDF, images et vidéos sont admis.'));
    }
  }
});

/**
 * Route d'upload
 */
router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const patientId = req.body.id_patient;
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'ID du patient manquant dans la requête'
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    // Construction de l'URL publique du fichier
    const url_fichier = `${baseUrl}/uploads/patients/${patientId}/${uploadedFile.filename}`;

    res.status(200).json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: {
        url_fichier: url_fichier,
        nom_fichier: uploadedFile.originalname,
        taille_fichier: uploadedFile.size,
        type_fichier: uploadedFile.mimetype.split('/')[0] === 'application' ? 'pdf' : uploadedFile.mimetype.split('/')[0]
      }
    });
  } catch (error: any) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'upload du fichier'
    });
  }
});

export default router;