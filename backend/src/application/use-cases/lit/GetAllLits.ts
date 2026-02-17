import { ILitRepository } from '../../../domain/repositories/ILitRepository';
import { Lit } from '../../../domain/entities/Lit';

export class GetAllLits {
    constructor(private litRepository: ILitRepository) {}

    async execute(): Promise<Lit[]> {
        return this.litRepository.findAll();
    }
}