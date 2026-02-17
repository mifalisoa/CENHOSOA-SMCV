import { AppError } from './AppError';
import { HTTP_STATUS } from '../../config/constants';

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, HTTP_STATUS.BAD_REQUEST);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}