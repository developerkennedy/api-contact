import { CreateCategoryDto } from '../../domain/category.entity';
import { AppError } from '../../shared/errors/AppError';
import { ICategoryRepository } from '../../repositories/categories/interface/ICategoryRepository';

export class CreateCategory {
    constructor(private readonly repository: ICategoryRepository) {}

    async execute(data: CreateCategoryDto) {
        const name = data.name.trim();
        const existing = await this.repository.findByName(name, data.user_id);
        if (existing) {
            throw new AppError('A category with this name already exists', 409);
        }
        return this.repository.create({ ...data, name });
    }
}
