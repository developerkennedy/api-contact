import { Request, Response } from 'express';
import { Logout } from '../../use-cases/auth/logout';
import { logoutSchema } from '../../auth/schemas';

export class LogoutController {
    constructor(private readonly useCase: Logout) {}

    async handle(req: Request, res: Response) {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { refresh_token } = logoutSchema.parse(req.body);
        await this.useCase.execute(refresh_token);
        return res.status(204).send();
    }
}
