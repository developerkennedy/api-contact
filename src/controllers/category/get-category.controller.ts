import { Request, Response } from 'express';
import { GetCategory } from '../../use-cases/category/get-category';
import { z } from 'zod';

const paramsSchema = z.object({ id: z.uuid() });

export class GetCategoryController {
    constructor(private readonly useCase: GetCategory) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = paramsSchema.parse(req.params);
        const user_id = req.user.id;

        const category = await this.useCase.execute(id, user_id);

        return res.status(200).json(category);
    }
}
