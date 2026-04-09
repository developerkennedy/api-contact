import { Request, Response } from "express";
import { Register } from "../../use-cases/auth/register";
import { registerSchema } from "../../auth/schemas";

export class RegisterController {
    constructor(private readonly useCase: Register) {}

    async handle(req: Request, res: Response) {
        const { name, email, password } = registerSchema.parse(req.body);
        const user = await this.useCase.execute({ name, email, password });
        return res.status(201).json(user);
    }
}
