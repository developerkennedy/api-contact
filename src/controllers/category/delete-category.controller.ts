import { Request, Response } from 'express';
import { DeleteCategory } from '../../use-cases/category/delete-category';
import { z } from 'zod';

const paramsSchema = z.object({ id: z.uuid() });

export class DeleteCategoryController {
    constructor(private readonly useCase: DeleteCategory) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = paramsSchema.parse(req.params);
        const user_id = req.user.id;

        await this.useCase.execute(id, user_id);

        return res.status(204).send();
    }
}
