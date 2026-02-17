export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string | {
        code?: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type RoleType = 'admin' | 'docteur' | 'secretaire' | 'interne' | 'stagiaire';