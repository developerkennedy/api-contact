import { describe, it, expect } from 'vitest';
import { Register } from '../../src/use-cases/auth/register';
import { Login } from '../../src/use-cases/auth/login';
import { AppError } from '../../src/shared/errors/AppError';
import { comparePassword, hash } from '../../src/shared/utils/hash';
import { verifyToken } from '../../src/auth/jwt';
import { IUserRepository } from '../../src/repositories/user/interfaces/IUserRepository';
import { IRefreshTokenRepository } from '../../src/repositories/refresh-token/interfaces/IRefreshTokenRepository';
import { UserDTO } from '../../src/domain/user.entity';
import { RefreshTokenDTO } from '../../src/domain/refresh-token.entity';

function makeUserRepository(overrides: Partial<IUserRepository> = {}): IUserRepository {
    return {
        async create(data) {
            return { id: '11111111-1111-1111-1111-111111111111', ...data } as UserDTO;
        },
        async findByEmail() {
            return null;
        },
        ...overrides,
    };
}

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

describe('Register', () => {
    it('normalizes email, hashes password, and hides password in response', async () => {
        let createdPayload: UserDTO | null = null;

        const repository = makeUserRepository({
            async create(data) {
                const user = { id: '11111111-1111-1111-1111-111111111111', ...data } as UserDTO;
                createdPayload = user;
                return user;
            },
        });

        const useCase = new Register(repository);
        const result = await useCase.execute({
            name: 'Alice',
            email: '  Alice@Example.COM  ',
            password: 'StrongPass1!',
        });

        expect(result.id).toBe('11111111-1111-1111-1111-111111111111');
        expect(result.email).toBe('alice@example.com');
        expect('password' in result).toBe(false);
        expect(createdPayload).toBeTruthy();
        expect(createdPayload!.email).toBe('alice@example.com');
        expect(createdPayload!.password).not.toBe('StrongPass1!');
        expect(await comparePassword('StrongPass1!', createdPayload!.password)).toBe(true);
    });

    it('rejects duplicate email', async () => {
        const repository = makeUserRepository({
            async findByEmail(email) {
                return {
                    id: '11111111-1111-1111-1111-111111111111',
                    name: 'Alice',
                    email,
                    password: 'hashed',
                };
            },
        });

        const useCase = new Register(repository);

        await expect(
            useCase.execute({
                name: 'Alice',
                email: 'alice@example.com',
                password: 'StrongPass1!',
            })
        ).rejects.toThrow(AppError);

        try {
            await useCase.execute({
                name: 'Alice',
                email: 'alice@example.com',
                password: 'StrongPass1!',
            });
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(409);
            expect((error as AppError).message).toBe('Email already in use');
        }
    });
});

describe('Login', () => {
    it('normalizes email and returns access_token and refresh_token', async () => {
        const hashedPassword = await hash('StrongPass1!');
        let lookedUpEmail: string | null = null;
        let createdRefreshToken = false;

        const repository = makeUserRepository({
            async findByEmail(email) {
                lookedUpEmail = email;
                return {
                    id: '22222222-2222-4222-8222-222222222222',
                    name: 'Bob',
                    email,
                    password: hashedPassword,
                };
            },
        });

        const refreshTokenRepo = makeRefreshTokenRepository({
            async create(data) {
                createdRefreshToken = true;
                return {
                    id: 'rt-11111111-1111-1111-1111-111111111111',
                    is_rotated: false,
                    created_at: new Date(),
                    ...data,
                } as RefreshTokenDTO;
            },
        });

        const useCase = new Login(repository, refreshTokenRepo);
        const result = await useCase.execute('  Bob@Example.COM ', 'StrongPass1!');
        const payload = verifyToken(result.access_token);

        expect(lookedUpEmail).toBe('bob@example.com');
        expect(payload.id).toBe('22222222-2222-4222-8222-222222222222');
        expect(result.refresh_token).toBeTruthy();
        expect(createdRefreshToken).toBe(true);
    });

    it('rejects invalid credentials', async () => {
        const repository = makeUserRepository();
        const refreshTokenRepo = makeRefreshTokenRepository();
        const useCase = new Login(repository, refreshTokenRepo);

        try {
            await useCase.execute('nobody@example.com', 'wrong-password');
            expect.fail('should have thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect((error as AppError).statusCode).toBe(401);
            expect((error as AppError).message).toBe('Invalid credentials');
        }
    });
});
