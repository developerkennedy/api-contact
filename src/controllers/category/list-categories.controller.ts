import { Request, Response } from 'express';
import { ListCategories } from '../../use-cases/category/list-categories';
import { parsePagination } from '../../shared/utils/parse-pagination';

export class ListCategoriesController {
    constructor(private readonly useCase: ListCategories) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const user_id = req.user.id;
        const pagination = parsePagination(req.query);

        const result = await this.useCase.execute(user_id, pagination);

        return res.status(200).json(result);
    }
}
