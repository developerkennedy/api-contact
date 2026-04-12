import { ICategoryRepository } from '../../repositories/categories/interface/ICategoryRepository';
import { CategoryDTO } from '../../domain/category.entity';
import { AppError } from '../../shared/errors/AppError';

export class GetCategory {
    constructor(private readonly repository: ICategoryRepository) {}

    async execute(id: string, user_id: string): Promise<CategoryDTO> {
        const category = await this.repository.findById(id, user_id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return category;
    }
}
