import { Router } from 'express';
import { UtilisateurController } from '../controllers/UtilisateurController';
import { GetUtilisateurById } from '../../../application/use-cases/utilisateur/GetUtilisateurById';
import { ListUtilisateurs } from '../../../application/use-cases/utilisateur/ListUtilisateurs';
import { GetUtilisateursByRole } from '../../../application/use-cases/utilisateur/GetUtilisateursByRole';
import { UpdateUtilisateur } from '../../../application/use-cases/utilisateur/UpdateUtilisateur';
import { DeactivateUtilisateur } from '../../../application/use-cases/utilisateur/DeactivateUtilisateur';
import { ActivateUtilisateur } from '../../../application/use-cases/utilisateur/ActivateUtilisateur';
import { ChangePassword } from '../../../application/use-cases/utilisateur/ChangePassword';
import { PostgresUtilisateurRepository } from '../../../infrastructure/database/postgres/repositories/PostgresUtilisateurRepository';
import { pool } from '../../../config/database';
import { validateRequest } from '../middlewares/validation.middleware';
import { updateUtilisateurSchema, changePasswordSchema } from '../validators/utilisateur.validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { ROLES } from '../../../config/constants';

// Dependency Injection
const utilisateurRepository = new PostgresUtilisateurRepository(pool);
const getUtilisateurById = new GetUtilisateurById(utilisateurRepository);
const listUtilisateurs = new ListUtilisateurs(utilisateurRepository);
const getUtilisateursByRole = new GetUtilisateursByRole(utilisateurRepository);
const updateUtilisateur = new UpdateUtilisateur(utilisateurRepository);
const deactivateUtilisateur = new DeactivateUtilisateur(utilisateurRepository);
const activateUtilisateur = new ActivateUtilisateur(utilisateurRepository);
const changePassword = new ChangePassword(utilisateurRepository);

const utilisateurController = new UtilisateurController(
    getUtilisateurById,
    listUtilisateurs,
    getUtilisateursByRole,
    updateUtilisateur,
    deactivateUtilisateur,
    activateUtilisateur,
    changePassword
);

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @route GET /api/utilisateurs
 * @desc Liste de tous les utilisateurs (avec pagination)
 * @access Private (admin)
 */
router.get('/', roleMiddleware(ROLES.ADMIN), utilisateurController.list);

/**
 * @route GET /api/utilisateurs/role/:role
 * @desc Liste des utilisateurs par rôle
 * @access Private
 */
router.get('/role/:role', utilisateurController.getByRole);

/**
 * @route GET /api/utilisateurs/:id
 * @desc Détails d'un utilisateur
 * @access Private
 */
router.get('/:id', utilisateurController.getById);

/**
 * @route PATCH /api/utilisateurs/:id
 * @desc Mettre à jour un utilisateur
 * @access Private (admin)
 */
router.patch(
    '/:id',
    roleMiddleware(ROLES.ADMIN),
    validateRequest(updateUtilisateurSchema),
    utilisateurController.update
);

/**
 * @route PATCH /api/utilisateurs/:id/deactivate
 * @desc Désactiver un utilisateur
 * @access Private (admin)
 */
router.patch('/:id/deactivate', roleMiddleware(ROLES.ADMIN), utilisateurController.deactivate);

/**
 * @route PATCH /api/utilisateurs/:id/activate
 * @desc Activer un utilisateur
 * @access Private (admin)
 */
router.patch('/:id/activate', roleMiddleware(ROLES.ADMIN), utilisateurController.activate);

/**
 * @route PATCH /api/utilisateurs/change-password
 * @desc Changer son propre mot de passe
 * @access Private
 */
router.patch(
    '/change-password',
    validateRequest(changePasswordSchema),
    utilisateurController.changePasswordHandler
);

export default router;