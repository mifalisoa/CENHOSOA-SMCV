import { ApiResponse } from '../types';

export const successResponse = <T>(
    data: T,
    message?: string
): ApiResponse<T> => {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
};

export const errorResponse = (
    error: string,
    message?: string
): ApiResponse => {
    return {
        success: false,
        message,
        error,
        timestamp: new Date().toISOString(),
    };
};