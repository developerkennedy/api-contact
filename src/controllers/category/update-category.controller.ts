import { Request, Response } from 'express';
import { UpdateCategory } from '../../use-cases/category/update-category';
import { updateCategorySchema } from '../../domain/category.entity';
import { z } from 'zod';

const paramsSchema = z.object({ id: z.uuid() });

export class UpdateCategoryController {
    constructor(private readonly useCase: UpdateCategory) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = paramsSchema.parse(req.params);
        const user_id = req.user.id;
        const data = updateCategorySchema.parse(req.body);

        const category = await this.useCase.execute(id, user_id, data);

        return res.status(200).json(category);
    }
}
