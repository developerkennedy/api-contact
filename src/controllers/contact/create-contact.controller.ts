import { Request, Response } from 'express';
import { CreateContact } from '../../use-cases/contact/create-contact';
import { createContactSchema } from '../../domain/contact.entity';

export class CreateContactController {
    constructor(private readonly useCase: CreateContact) {}

    async handle(req: Request, res: Response) {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const user_id = req.user.id;
        const data = createContactSchema.parse({ ...req.body, user_id });

        const contact = await this.useCase.execute(data);

        return res.status(201).json(contact);
    }
}
