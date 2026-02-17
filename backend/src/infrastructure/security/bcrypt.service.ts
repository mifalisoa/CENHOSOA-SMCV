import bcrypt from 'bcrypt';
import { env } from '../../config/env';

export class BcryptService {
    /**
     * Hash un mot de passe
     */
    static async hash(password: string): Promise<string> {
        return bcrypt.hash(password, env.BCRYPT_ROUNDS);
    }

    /**
     * Compare un mot de passe avec son hash
     */
    static async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Valide la force du mot de passe
     */
    static validatePasswordStrength(password: string): { valid: boolean; message?: string } {
        if (password.length < 8) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
        }
        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
        }
        return { valid: true };
    }
}