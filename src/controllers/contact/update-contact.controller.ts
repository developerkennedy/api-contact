import { Request, Response } from "express";
import { UpdateContact } from "../../use-cases/contact/update-contact";
import { updateContactSchema } from "../../domain/contact.entity";
import { z } from "zod";

const paramsSchema = z.object({ id: z.uuid() });

export class UpdateContactController {
    constructor(private readonly useCase: UpdateContact) {}

    async handle(req: Request, res: Response) {
        const { id } = paramsSchema.parse(req.params);
        const user_id = req.user!.id;
        const data = updateContactSchema.parse(req.body);
        const contact = await this.useCase.execute(id, user_id, data);
        return res.status(200).json(contact);
    }
}