import { Request, Response } from "express";
import { ListContacts } from "../../use-cases/contact/list-contacts";

export class ListContactsController {
    constructor(private readonly useCase: ListContacts) {}

    async handle(req: Request, res: Response) {
        const user_id = req.user!.id;
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);

        const result = await this.useCase.execute(user_id, { limit, offset });

        return res.status(200).json(result);
    }
}
