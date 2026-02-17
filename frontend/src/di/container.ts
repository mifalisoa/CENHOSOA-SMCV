import { AuthRepository } from '../infrastructure/repositories/AuthRepository';
import { PatientRepository } from '../infrastructure/repositories/PatientRepository';
import { LoginUseCase } from '../core/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '../core/use-cases/auth/LogoutUseCase';
import { GetCurrentUserUseCase } from '../core/use-cases/auth/GetCurrentUserUseCase';
import { GetPatientsUseCase } from '../core/use-cases/patient/GetPatientsUseCase';
import { GetPatientByIdUseCase } from '../core/use-cases/patient/GetPatientByIdUseCase';
import { CreatePatientUseCase } from '../core/use-cases/patient/CreatePatientUseCase';
import { UpdatePatientUseCase } from '../core/use-cases/patient/UpdatePatientUseCase';
import { DeletePatientUseCase } from '../core/use-cases/patient/DeletePatientUseCase';

// Repositories
const authRepository = new AuthRepository();
const patientRepository = new PatientRepository();

// Use Cases - Auth
export const loginUseCase = new LoginUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

// Use Cases - Patient
export const getPatientsUseCase = new GetPatientsUseCase(patientRepository);
export const getPatientByIdUseCase = new GetPatientByIdUseCase(patientRepository);
export const createPatientUseCase = new CreatePatientUseCase(patientRepository);
export const updatePatientUseCase = new UpdatePatientUseCase(patientRepository);
export const deletePatientUseCase = new DeletePatientUseCase(patientRepository);