import type { IAuthRepository } from '../../repositories/IAuthRepository';
import type { LoginCredentials, AuthResponse } from '../../entities/User';

export class LoginUseCase {
  // 1. Déclarer explicitement la propriété
  private authRepository: IAuthRepository;

  // 2. Assigner manuellement dans le constructeur
  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔵 [LoginUseCase] Execute avec:', credentials);
    
    // Valider les credentials
    if (!credentials.email || !credentials.password) {
      throw new Error('Email et mot de passe requis');
    }

    // Appeler le repository
    const response = await this.authRepository.login(credentials);
    
    console.log('✅ [LoginUseCase] Login réussi');
    
    return response;
  }
}