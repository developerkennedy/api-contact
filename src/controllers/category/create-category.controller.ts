import { Request, Response } from 'express';
import { CreateCategory } from '../../use-cases/category/create-category';
import { createCategorySchema } from '../../domain/category.entity';

export class CreateCategoryController {
    constructor(private readonly useCase: CreateCategory) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const user_id = req.user.id;
        const { name } = createCategorySchema.parse({ ...req.body, user_id });

        const category = await this.useCase.execute({ name, user_id });

        return res.status(201).json(category);
    }
}
