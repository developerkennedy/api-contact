import { Request, Response } from 'express';
import { Login } from '../../use-cases/auth/login';
import { loginSchema } from '../../auth/schemas';

export class LoginController {
    constructor(private readonly useCase: Login) {}

    async handle(req: Request, res: Response) {
        const { email, password } = loginSchema.parse(req.body);
        const result = await this.useCase.execute(email, password);
        return res.status(200).json(result);
    }
}
