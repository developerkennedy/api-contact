import { PaginationParams } from '../types/pagination';

export function parsePagination(query: Record<string, unknown>): PaginationParams {
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const offset = Math.max(Number(query.offset) || 0, 0);
    return { limit, offset };
}
