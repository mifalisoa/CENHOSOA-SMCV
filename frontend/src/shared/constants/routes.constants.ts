export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Patients
  PATIENTS: '/patients',
  PATIENT_DETAILS: (id: number) => `/patients/${id}`,
  PATIENT_NEW: '/patients/new',
  PATIENT_EDIT: (id: number) => `/patients/${id}/edit`,
  
  // Admissions
  ADMISSIONS: '/admissions',
  ADMISSION_DETAILS: (id: number) => `/admissions/${id}`,
  ADMISSION_NEW: '/admissions/new',
  
  // Rendez-vous
  RENDEZ_VOUS: '/rendez-vous',
  RDV_NEW: '/rendez-vous/new',
  
  // Prescriptions
  PRESCRIPTIONS: '/prescriptions',
  
  // Observations
  OBSERVATIONS: '/observations',
  
  // Lits
  LITS: '/lits',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  
  // Utilisateurs
  UTILISATEURS: '/utilisateurs',
};