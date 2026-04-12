import { Request, Response } from 'express';
import { RefreshToken } from '../../use-cases/auth/refresh-token';
import { refreshSchema } from '../../auth/schemas';

export class RefreshTokenController {
    constructor(private readonly useCase: RefreshToken) {}

    async handle(req: Request, res: Response) {
        const { refresh_token } = refreshSchema.parse(req.body);
        const result = await this.useCase.execute(refresh_token);
        return res.status(200).json(result);
    }
}
