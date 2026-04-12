import { UpdateCategoryDto } from '../../domain/category.entity';
import { AppError } from '../../shared/errors/AppError';
import { ICategoryRepository } from '../../repositories/categories/interface/ICategoryRepository';

export class UpdateCategory {
    constructor(private readonly repository: ICategoryRepository) {}

    async execute(id: string, user_id: string, data: UpdateCategoryDto) {
        const category = await this.repository.findById(id, user_id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }

        if (data.name) {
            const name = data.name.trim();
            const existing = await this.repository.findByName(name, user_id);
            if (existing && existing.id !== id) {
                throw new AppError('A category with this name already exists', 409);
            }
            data = { ...data, name };
        }

        return this.repository.update(id, user_id, data);
    }
}
