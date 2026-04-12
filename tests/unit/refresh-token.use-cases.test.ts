import { describe, it, expect, vi } from 'vitest';
import { RefreshToken } from '../../src/use-cases/auth/refresh-token';
import { Logout } from '../../src/use-cases/auth/logout';
import { AppError } from '../../src/shared/errors/AppError';
import { IRefreshTokenRepository } from '../../src/repositories/refresh-token/interfaces/IRefreshTokenRepository';
import { RefreshTokenDTO } from '../../src/domain/refresh-token.entity';
import {
    generateRefreshToken,
    hashRefreshToken,
    refreshTokenExpiresAt,
} from '../../src/auth/refresh-token';
import { verifyToken } from '../../src/auth/jwt';

function makeRefreshTokenRepository(
    overrides: Partial<IRefreshTokenRepository> = {}
): IRefreshTokenRepository {
    return {
        async create(data) {
            return {
                id: 'rt-11111111-1111-1111-1111-111111111111',
                is_rotated: false,
                created_at: new Date(),
                ...data,
            } as RefreshTokenDTO;
        },
        async findByHash() {
            return null;
        },
        async deleteById() {},
        async deleteByFamilyId() {},
        async deleteByUserId() {},
        async deleteExpired() {},
        async rotate(_oldId, newToken) {
            return {
                id: 'rt-22222222-2222-2222-2222-222222222222',
                is_rotated: false,
                created_at: new Date(),
                ...newToken,
            } as RefreshTokenDTO;
        },
        ...overrides,
    };
}

const VALID_USER_ID = '22222222-2222-4222-8222-222222222222';
const VALID_FAMILY_ID = '33333333-3333-4333-8333-333333333333';

function makeStoredToken(overrides: Partial<RefreshTokenDTO> = {}): RefreshTokenDTO {
    return {
        id: 'rt-44444444-4444-4444-4444-444444444444',
        token_hash: 'a'.repeat(64),
        user_id: VALID_USER_ID,
        family_id: VALID_FAMILY_ID,
        is_rotated: false,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ...overrides,
    };
}

describe('RefreshToken use-case', () => {
    it('returns a new token pair for a valid refresh token', async () => {
        const stored = makeStoredToken();
        let rotatedOldId: string | null = null;

        const repo = makeRefreshTokenRepository({
            async findByHash() {
                return stored;
            },
            async rotate(oldId, newToken) {
                rotatedOldId = oldId;
                return {
                    id: 'rt-new',
                    is_rotated: false,
                    created_at: new Date(),
                    ...newToken,
                } as RefreshTokenDTO;
            },
        });

        const useCase = new RefreshToken(repo);
        const result = await useCase.execute('any-uuid-token');

        expect(result.access_token).toBeTruthy();
        expect(result.refresh_token).toBeTruthy();
        expect(rotatedOldId).toBe(stored.id);

        const payload = verifyToken(result.access_token);
        expect(payload.id).toBe(VALID_USER_ID);
    });

    it('rejects an unknown refresh token', async () => {
        const repo = makeRefreshTokenRepository();
        const useCase = new RefreshToken(repo);

        try {
            await useCase.execute('unknown-token');
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(401);
            expect((error as AppError).message).toBe('Invalid refresh token');
        }
    });

    it('detects token reuse and invalidates the entire family', async () => {
        const stored = makeStoredToken({ is_rotated: true });
        let deletedFamilyId: string | null = null;

        const repo = makeRefreshTokenRepository({
            async findByHash() {
                return stored;
            },
            async deleteByFamilyId(familyId) {
                deletedFamilyId = familyId;
            },
        });

        const useCase = new RefreshToken(repo);

        try {
            await useCase.execute('reused-token');
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(401);
            expect((error as AppError).message).toBe('Token reuse detected');
            expect(deletedFamilyId).toBe(VALID_FAMILY_ID);
        }
    });

    it('rejects an expired refresh token and deletes it', async () => {
        const stored = makeStoredToken({
            expires_at: new Date(Date.now() - 1000),
        });
        let deletedId: string | null = null;

        const repo = makeRefreshTokenRepository({
            async findByHash() {
                return stored;
            },
            async deleteById(id) {
                deletedId = id;
            },
        });

        const useCase = new RefreshToken(repo);

        try {
            await useCase.execute('expired-token');
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(401);
            expect((error as AppError).message).toBe('Refresh token expired');
            expect(deletedId).toBe(stored.id);
        }
    });

    it('calls deleteExpired opportunistically', async () => {
        const stored = makeStoredToken();
        let cleanupCalled = false;

        const repo = makeRefreshTokenRepository({
            async findByHash() {
                return stored;
            },
            async deleteExpired() {
                cleanupCalled = true;
            },
        });

        const useCase = new RefreshToken(repo);
        await useCase.execute('valid-token');

        // Wait a tick for the fire-and-forget promise
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(cleanupCalled).toBe(true);
    });
});

describe('Logout use-case', () => {
    it('deletes the refresh token when found', async () => {
        const stored = makeStoredToken();
        let deletedId: string | null = null;

        const repo = makeRefreshTokenRepository({
            async findByHash() {
                return stored;
            },
            async deleteById(id) {
                deletedId = id;
            },
        });

        const useCase = new Logout(repo);
        await useCase.execute('some-token');

        expect(deletedId).toBe(stored.id);
    });

    it('does not throw when token is not found (idempotent)', async () => {
        const repo = makeRefreshTokenRepository();
        const useCase = new Logout(repo);

        await expect(useCase.execute('nonexistent-token')).resolves.toBeUndefined();
    });
});

describe('Refresh token utilities', () => {
    it('generateRefreshToken returns a valid UUID raw and 64-char hex hash', () => {
        const { raw, hash } = generateRefreshToken();

        expect(raw).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
        expect(hash).toHaveLength(64);
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('hashRefreshToken is deterministic', () => {
        const token = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
        const hash1 = hashRefreshToken(token);
        const hash2 = hashRefreshToken(token);

        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64);
    });

    it('refreshTokenExpiresAt returns a future date', () => {
        const expires = refreshTokenExpiresAt();
        expect(expires.getTime()).toBeGreaterThan(Date.now());
    });
});
