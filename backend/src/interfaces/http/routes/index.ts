import { Router } from 'express';
import authRoutes from './auth.routes';
import utilisateurRoutes from './utilisateur.routes';
import patientRoutes from './patient.routes';
import rendezVousRoutes from './rendez-vous.routes';
import admissionRoutes from './admission.routes';
import litRoutes from './lit.routes';
import prescriptionRoutes from './prescription.routes';
import observationRoutes from './observation.routes';
import notificationRoutes from './notification.routes';
import bilanBiologiqueRoutes from './bilan-biologique.routes';
import soinMedicalRoutes from './soin-medical.routes';
import soinInfirmierRoutes from './soin-infirmier.routes';
import traitementRoutes from './traitement.routes';
import documentPatientRoutes from './document-patient.routes';
import compteRenduRoutes from './compte-rendu.routes';

const router = Router();

// Middleware de debug
router.use((req, res, next) => {
    console.log(`📡 [API] ${req.method} ${req.path}`);
    next();
});


// Montage des routes
router.use('/auth', authRoutes);
router.use('/utilisateurs', utilisateurRoutes);
router.use('/patients', patientRoutes);
router.use('/rendez-vous', rendezVousRoutes);
router.use('/admissions', admissionRoutes);
router.use('/lits', litRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/observations', observationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/bilans-biologiques', bilanBiologiqueRoutes);
router.use('/soins-medicaux', soinMedicalRoutes);
router.use('/soins-infirmiers', soinInfirmierRoutes);
router.use('/traitements', traitementRoutes);
router.use('/documents-patients', documentPatientRoutes);
router.use('/comptes-rendus', compteRenduRoutes);

export default router;