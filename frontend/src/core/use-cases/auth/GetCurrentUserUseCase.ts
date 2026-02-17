import type { IAuthRepository } from '../../repositories/IAuthRepository';
import type { User } from '../../entities/User';

export class GetCurrentUserUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<User> {
    return this.authRepository.getCurrentUser();
  }
}