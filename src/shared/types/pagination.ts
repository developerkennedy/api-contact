export interface PaginationParams {
    limit: number;
    offset: number;
}

export interface PaginationResult<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}
