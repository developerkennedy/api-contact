import { Request, Response } from "express";
import { CreateContact } from "../../use-cases/contact/create-contact";
import { z } from "zod";

const bodySchema = z.object({
    name: z.string().min(1),
    email: z.email(),
});

export class CreateContactController {
    constructor(private readonly useCase: CreateContact) {}

    async handle(req: Request, res: Response) {
        const { name, email } = bodySchema.parse(req.body);
        const user_id = req.user!.id;

        const contact = await this.useCase.execute({ name, email, user_id });

        return res.status(201).json(contact);
    }
}
