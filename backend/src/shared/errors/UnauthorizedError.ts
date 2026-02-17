import { AppError } from './AppError';
import { HTTP_STATUS } from '../../config/constants';

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Non autorisé') {
        super(message, HTTP_STATUS.UNAUTHORIZED);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}