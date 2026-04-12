import { IRefreshTokenRepository } from '../../repositories/refresh-token/interfaces/IRefreshTokenRepository';
import { AppError } from '../../shared/errors/AppError';
import { signToken } from '../../auth/jwt';
import {
    generateRefreshToken,
    hashRefreshToken,
    refreshTokenExpiresAt,
} from '../../auth/refresh-token';
import { logger } from '../../shared/logger/logger';

export class RefreshToken {
    constructor(private readonly repository: IRefreshTokenRepository) {}

    async execute(rawToken: string): Promise<{ access_token: string; refresh_token: string }> {
        const tokenHash = hashRefreshToken(rawToken);
        const stored = await this.repository.findByHash(tokenHash);

        if (!stored) {
            throw new AppError('Invalid refresh token', 401);
        }

        if (stored.is_rotated) {
            await this.repository.deleteByFamilyId(stored.family_id);
            logger.warn({ familyId: stored.family_id }, 'Refresh token reuse detected');
            throw new AppError('Token reuse detected', 401);
        }

        if (stored.expires_at < new Date()) {
            await this.repository.deleteById(stored.id);
            throw new AppError('Refresh token expired', 401);
        }

        const { raw, hash } = generateRefreshToken();

        await this.repository.rotate(stored.id, {
            token_hash: hash,
            user_id: stored.user_id,
            family_id: stored.family_id,
            expires_at: refreshTokenExpiresAt(),
        });

        // Opportunistic cleanup
        this.repository.deleteExpired().catch((err) => {
            logger.error({ err }, 'Failed to cleanup expired refresh tokens');
        });

        const access_token = signToken({ id: stored.user_id });
        return { access_token, refresh_token: raw };
    }
}
