export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // Patients
  PATIENTS: '/patients',
  PATIENTS_EXTERNES: '/patients/externes',
  PATIENTS_HOSPITALISES: '/patients/hospitalises',
  PATIENTS_SEARCH: '/patients/search',
  PATIENTS_STATS: '/patients/stats',
  PATIENT_BY_ID: (id: number) => `/patients/${id}`,

    // Admissions
  ADMISSIONS: '/admissions',
  ADMISSIONS_EN_COURS: '/admissions/en-cours',
  ADMISSION_BY_ID: (id: number) => `/admissions/${id}`,
  ADMISSION_ASSIGN_LIT: (id: number) => `/admissions/${id}/assign-lit`,
  ADMISSION_CLOTURER: (id: number) => `/admissions/${id}/cloturer`,

    // Lits
  LITS: '/lits',
  LITS_STATISTIQUES: '/lits/statistiques',
  LITS_INITIALISER: '/lits/initialiser',
  LIT_BY_ID: (id: number) => `/lits/${id}`,
  LIT_LIBERER: (id: number) => `/lits/${id}/liberer`,
};