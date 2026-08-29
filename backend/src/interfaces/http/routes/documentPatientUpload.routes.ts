// backend/src/interfaces/http/routes/documentPatientUpload.routes.ts
//
// CHANGEMENTS CUMULES :
// 1. (deja applique) id_patient valide comme entier positif -> protege contre
//    le path traversal / ecriture de fichier arbitraire.
// 2. (nouveau) Apres ecriture sur disque, on verifie le contenu REEL du fichier
//    (signature / magic bytes) via la librairie "file-type", au lieu de faire
//    confiance au mimetype declare par le client dans la requete HTTP -- ce
//    dernier est un simple header, trivialement falsifiable. Si le contenu ne
//    correspond a aucun type autorise, le fichier est supprime et la requete
//    rejetee.
//
// Necessite : npm install file-type (dans backend/)

import { authMiddleware } from '../middlewares/auth.middleware';

import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

router.use(authMiddleware);

const UPLOADS_BASE_DIR = path.join(__dirname, '../../../../uploads/patients');

function parsePatientId(raw: unknown): number | null {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const patientId = parsePatientId(req.body.id_patient);

    if (patientId === null) {
      cb(new Error('id_patient invalide : un identifiant numerique est requis'), '');
      return;
    }

    const uploadDir = path.join(UPLOADS_BASE_DIR, String(patientId));

    const resolved = path.resolve(uploadDir);
    if (!resolved.startsWith(path.resolve(UPLOADS_BASE_DIR) + path.sep)) {
      cb(new Error('Chemin de destination invalide'), '');
      return;
    }

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

// Premiere passe, rapide : filtre sur le mimetype declare. Volontairement
// laisse en l'etat -- c'est juste un premier tri, la vraie verification
// se fait apres coup sur le contenu reel (voir REAL_ALLOWED_MIMES plus bas).
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

// Types reellement autorises, detectes par signature de fichier (magic bytes),
// pas par ce que le client pretend. Note : file-type detecte les fichiers AVI
// sous 'video/x-msvideo', pas 'video/avi' -- c'est le vrai identifiant MIME
// standard, different de celui utilise dans le fileFilter cote client.
const REAL_ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'video/mp4',
  'video/x-msvideo',
];

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const uploadedFile = req.file;

  try {
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const patientId = parsePatientId(req.body.id_patient);
    if (patientId === null) {
      fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({
        success: false,
        message: 'ID du patient manquant ou invalide dans la requête'
      });
    }

    // file-type est une librairie ESM -- import dynamique pour rester
    // compatible peu importe la config module du projet (CommonJS ou ESM).
    const { fileTypeFromFile } = await import('file-type');
    const detected = await fileTypeFromFile(uploadedFile.path);

    if (!detected || !REAL_ALLOWED_MIMES.includes(detected.mime)) {
      fs.unlinkSync(uploadedFile.path);
      return res.status(400).json({
        success: false,
        message: 'Le contenu du fichier ne correspond pas à un type autorisé.'
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
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
    // Si le fichier a ete ecrit sur disque avant l'erreur, on nettoie pour
    // ne pas laisser trainer un fichier orphelin non reference en base.
    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'upload du fichier'
    });
  }
});

export default router;