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
};