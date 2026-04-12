import { randomUUID } from 'node:crypto';
import { IUserRepository } from '../../repositories/user/interfaces/IUserRepository';
import { IRefreshTokenRepository } from '../../repositories/refresh-token/interfaces/IRefreshTokenRepository';
import { AppError } from '../../shared/errors/AppError';
import { comparePassword } from '../../shared/utils/hash';
import { signToken } from '../../auth/jwt';
import { generateRefreshToken, refreshTokenExpiresAt } from '../../auth/refresh-token';

const DUMMY_HASH = '$2a$12$000000000000000000000uGBOBKFmlOTfMCaqGFS1RhSLgIVGeLy';

export class Login {
    constructor(
        private readonly repository: IUserRepository,
        private readonly refreshTokenRepository: IRefreshTokenRepository
    ) {}

    async execute(
        email: string,
        password: string
    ): Promise<{ access_token: string; refresh_token: string }> {
        const normalizedEmail = email.trim().toLowerCase();

        const user = await this.repository.findByEmail(normalizedEmail);

        const hashToCompare = user ? user.password : DUMMY_HASH;
        const valid = await comparePassword(password, hashToCompare);

        if (!user || !valid) {
            throw new AppError('Invalid credentials', 401);
        }

        const access_token = signToken({ id: user.id });
        const { raw, hash } = generateRefreshToken();

        await this.refreshTokenRepository.create({
            token_hash: hash,
            user_id: user.id,
            family_id: randomUUID(),
            expires_at: refreshTokenExpiresAt(),
        });

        return { access_token, refresh_token: raw };
    }
}
