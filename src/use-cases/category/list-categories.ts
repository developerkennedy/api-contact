import { ICategoryRepository } from '../../repositories/categories/interface/ICategoryRepository';
import { CategoryDTO } from '../../domain/category.entity';
import { PaginationParams, PaginationResult } from '../../shared/types/pagination';

export class ListCategories {
    constructor(private readonly repository: ICategoryRepository) {}

    async execute(
        user_id: string,
        pagination: PaginationParams
    ): Promise<PaginationResult<CategoryDTO>> {
        return this.repository.findAll(user_id, pagination);
    }
}
