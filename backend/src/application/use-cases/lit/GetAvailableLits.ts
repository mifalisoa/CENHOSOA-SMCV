import { ILitRepository } from '../../../domain/repositories/ILitRepository';
import { Lit } from '../../../domain/entities/Lit';

export class GetAvailableLits {
    constructor(private litRepository: ILitRepository) {}

    async execute(service?: string): Promise<Lit[]> {
        return this.litRepository.findAvailable(service);
    }
}