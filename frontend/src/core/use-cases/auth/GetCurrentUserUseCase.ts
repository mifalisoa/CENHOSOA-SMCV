import type { IAuthRepository } from '../../repositories/IAuthRepository';
import type { Utilisateur } from '../../entities/Utilisateur';

export class GetCurrentUserUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<Utilisateur> {
    return this.authRepository.getCurrentUser();
  }
}