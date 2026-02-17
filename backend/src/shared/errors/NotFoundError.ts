import { AppError } from './AppError';
import { HTTP_STATUS } from '../../config/constants';

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} non trouvé(e)`, HTTP_STATUS.NOT_FOUND);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}