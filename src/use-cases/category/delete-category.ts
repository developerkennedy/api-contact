import { AppError } from '../../shared/errors/AppError';
import { ICategoryRepository } from '../../repositories/categories/interface/ICategoryRepository';

export class DeleteCategory {
    constructor(private readonly repository: ICategoryRepository) {}

    async execute(id: string, user_id: string): Promise<void> {
        const category = await this.repository.findById(id, user_id);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return this.repository.delete(id, user_id);
    }
}
