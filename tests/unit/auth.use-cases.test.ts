import { describe, it, expect } from 'vitest';
import { Register } from '../../src/use-cases/auth/register';
import { Login } from '../../src/use-cases/auth/login';
import { AppError } from '../../src/shared/errors/AppError';
import { comparePassword, hash } from '../../src/shared/utils/hash';
import { verifyToken } from '../../src/auth/jwt';
import { IUserRepository } from '../../src/repositories/user/interfaces/IUserRepository';
import { UserDTO } from '../../src/domain/user.entity';

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
    it('normalizes email and returns a verifiable token', async () => {
        const hashedPassword = await hash('StrongPass1!');
        let lookedUpEmail: string | null = null;

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

        const useCase = new Login(repository);
        const result = await useCase.execute('  Bob@Example.COM ', 'StrongPass1!');
        const payload = verifyToken(result.token);

        expect(lookedUpEmail).toBe('bob@example.com');
        expect(payload.id).toBe('22222222-2222-4222-8222-222222222222');
    });

    it('rejects invalid credentials', async () => {
        const repository = makeUserRepository();
        const useCase = new Login(repository);

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
