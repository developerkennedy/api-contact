import { Request, Response } from 'express';
import { ListContacts } from '../../use-cases/contact/list-contacts';
import { parsePagination } from '../../shared/utils/parse-pagination';

export class ListContactsController {
    constructor(private readonly useCase: ListContacts) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const user_id = req.user.id;
        const pagination = parsePagination(req.query);

        const result = await this.useCase.execute(user_id, pagination);

        return res.status(200).json(result);
    }
}
