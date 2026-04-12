import { Request, Response } from 'express';
import { GetContact } from '../../use-cases/contact/get-contact';
import { z } from 'zod';

const paramsSchema = z.object({ id: z.uuid() });

export class GetContactController {
    constructor(private readonly useCase: GetContact) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = paramsSchema.parse(req.params);
        const user_id = req.user.id;

        const contact = await this.useCase.execute(id, user_id);

        return res.status(200).json(contact);
    }
}
