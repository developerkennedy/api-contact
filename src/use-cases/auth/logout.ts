import { IRefreshTokenRepository } from '../../repositories/refresh-token/interfaces/IRefreshTokenRepository';
import { hashRefreshToken } from '../../auth/refresh-token';

export class Logout {
    constructor(private readonly repository: IRefreshTokenRepository) {}

    async execute(rawToken: string): Promise<void> {
        const tokenHash = hashRefreshToken(rawToken);
        const stored = await this.repository.findByHash(tokenHash);

        if (stored) {
            await this.repository.deleteById(stored.id);
        }
    }
}
