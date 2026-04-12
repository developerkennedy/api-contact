import { randomUUID, createHash } from 'node:crypto';
import { env } from '../config/env';

export function generateRefreshToken(): { raw: string; hash: string } {
    const raw = randomUUID();
    const hash = hashRefreshToken(raw);
    return { raw, hash };
}

export function hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
}

export function refreshTokenExpiresAt(): Date {
    const now = new Date();
    now.setDate(now.getDate() + env.JWT_REFRESH_EXPIRY_DAYS);
    return now;
}
