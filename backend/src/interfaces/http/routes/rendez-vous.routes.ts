import { Router } from 'express';
import { RendezVousController } from '../controllers/RendezVousController';
import { authMiddleware }       from '../middlewares/auth.middleware';
import { roleMiddleware }       from '../middlewares/role.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware'; // ✅ nouveau

const router     = Router();
const controller = new RendezVousController();

router.use(authMiddleware);

// Lecture — tous les rôles
const LECTURE    = ['admin', 'medecin', 'interne', 'stagiaire', 'infirmier', 'secretaire'];
// Écriture — médecin, interne, secrétaire
const ECRITURE   = ['admin', 'medecin', 'interne', 'secretaire'];
// Annulation — médecin et secrétaire uniquement
const ANNULATION = ['admin', 'medecin', 'secretaire'];

router.get('/',
  roleMiddleware(LECTURE),
  permissionMiddleware('rdv.read'),
  (req, res) => controller.getAll(req, res)
);

router.get('/creneaux-disponibles',
  roleMiddleware(LECTURE),
  permissionMiddleware('rdv.read'),
  (req, res) => controller.getCreneauxDisponibles(req, res)
);

router.get('/:id',
  roleMiddleware(LECTURE),
  permissionMiddleware('rdv.read'),
  (req, res) => controller.getById(req, res)
);

router.post('/',
  roleMiddleware(ECRITURE),
  permissionMiddleware('rdv.write'),
  (req, res) => controller.create(req, res)
);

router.put('/:id',
  roleMiddleware(ECRITURE),
  permissionMiddleware('rdv.write'),
  (req, res) => controller.update(req, res)
);

router.delete('/:id',
  roleMiddleware(['admin', 'medecin']),
  permissionMiddleware('rdv.write'),
  (req, res) => controller.delete(req, res)
);

router.patch('/:id/confirmer',
  roleMiddleware(ECRITURE),
  permissionMiddleware('rdv.write'),
  (req, res) => controller.confirmer(req, res)
);

router.patch('/:id/annuler',
  roleMiddleware(ANNULATION),
  permissionMiddleware('rdv.cancel'),
  (req, res) => controller.annuler(req, res)
);

router.patch('/:id/terminer',
  roleMiddleware(['admin', 'medecin']),
  permissionMiddleware('rdv.write'),
  (req, res) => controller.marquerTermine(req, res)
);

router.patch('/:id/absent',
  roleMiddleware(['admin', 'medecin', 'secretaire']),
  permissionMiddleware('rdv.write'),
  (req, res) => controller.marquerAbsent(req, res)
);

router.patch('/:id/reporter',
  roleMiddleware(ECRITURE),
  permissionMiddleware('rdv.write'),
  (req, res) => controller.reporter(req, res)
);

export default router;